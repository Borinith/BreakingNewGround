import { ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatExpansionPanel } from '@angular/material/expansion';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, merge, of, switchMap } from 'rxjs';
import { ImageMetadata, UploadResult } from './images.model';
import { ImagesService } from './images.service';

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./images.component.css']
})
export class ImagesComponent implements OnInit {

  readonly separatorKeyCodes: readonly number[] = [ENTER];
  readonly pageSize = 12;

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('tagInput') tagInput?: ElementRef<HTMLInputElement>;
  @ViewChild('uploadPanel') uploadPanel?: MatExpansionPanel;

  images: ImageMetadata[] = [];
  loadedThumbnails = new Set<string>();
  total = 0;
  pageIndex = 0;
  isLoading = false;
  errorMessage: string | null = null;

  searchControl = new FormControl<string>('', { nonNullable: true });
  favoritesControl = new FormControl<boolean>(false, { nonNullable: true });

  selectedFile: File | null = null;
  uploadTags: string[] = [];
  tagInputControl = new FormControl<string>('', { nonNullable: true });
  tagSuggestions: string[] = [];
  isUploading = false;

  constructor(
    private service: ImagesService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef) { }

  ngOnInit(): void {
    merge(
      this.searchControl.valueChanges,
      this.favoritesControl.valueChanges
    ).pipe(
      debounceTime(200),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.syncUrl(0);
    });

    this.tagInputControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || !query.trim() || query.length < 2) {
          return of([] as string[]);
        }
        return this.service.suggestTags(query.trim()).pipe(
          catchError(() => of([] as string[]))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(suggestions => {
      this.tagSuggestions = suggestions.filter(s => !this.uploadTags.includes(s));
      this.cdr.detectChanges();
    });

    this.route.queryParamMap.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      this.searchControl.setValue(params.get('tag') ?? '', { emitEvent: false });
      this.favoritesControl.setValue(params.get('favorites') === 'true', { emitEvent: false });
      this.pageIndex = this.parsePageIndex(params.get('page'));

      this.loadImages(this.pageIndex);
    });
  }

  onPageChange(event: PageEvent): void {
    this.syncUrl(event.pageIndex);

    if (window.matchMedia('(max-width: 600px)').matches) {
      window.scrollTo({ top: 0 });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  addTagFromInput(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.uploadTags.includes(value)) {
      this.uploadTags.push(value);
    }
    event.chipInput?.clear();
    this.tagInputControl.setValue('');
  }

  addTagFromAutocomplete(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value as string;
    if (value && !this.uploadTags.includes(value)) {
      this.uploadTags.push(value);
    }
    if (this.tagInput) {
      this.tagInput.nativeElement.value = '';
    }
    this.tagInputControl.setValue('');
  }

  removeTag(tag: string): void {
    this.uploadTags = this.uploadTags.filter(t => t !== tag);
  }

  upload(): void {
    if (!this.selectedFile || this.isUploading) {
      return;
    }

    this.isUploading = true;
    this.cdr.detectChanges();

    const file = this.selectedFile;

    if (file.type.startsWith('video/')) {
      this.capturePoster(file)
        .then(poster => this.sendUpload(file, poster))
        .catch(err => {
          console.error('Poster capture error', err);
          this.isUploading = false;
          this.snackBar.open('Не удалось создать превью для видео', 'OK', { duration: 5000 });
          this.cdr.detectChanges();
        });
    } else {
      this.sendUpload(file);
    }
  }

  private sendUpload(file: File, thumbnail?: Blob): void {
    this.service.upload(file, this.uploadTags, thumbnail).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: result => {
        this.isUploading = false;
        this.showUploadFeedback(result);
        this.resetUploadForm();
        this.uploadPanel?.close();
        this.loadImages();
      },
      error: err => {
        console.error('Upload error', err);
        this.isUploading = false;
        this.snackBar.open('Не удалось загрузить файл', 'OK', { duration: 5000 });
        this.cdr.detectChanges();
      }
    });
  }

  private capturePoster(file: File): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      const objectUrl = URL.createObjectURL(file);

      const cleanup = () => URL.revokeObjectURL(objectUrl);

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(0.5, video.duration || 0);
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) {
          cleanup();
          reject(new Error('Canvas context unavailable'));
          return;
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          cleanup();
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('toBlob returned null'));
          }
        }, 'image/jpeg');
      };

      video.onerror = () => {
        cleanup();
        reject(new Error('Не удалось прочитать видео'));
      };

      video.src = objectUrl;
    });
  }

  trackById(_index: number, image: ImageMetadata): string {
    return image.id;
  }

  thumbnailUrl(id: string): string {
    return this.service.getThumbnailUrl(id);
  }

  onThumbnailLoaded(id: string): void {
    this.loadedThumbnails.add(id);
  }

  navigateToTag(tag: string): void {
    if (this.searchControl.value === tag) {
      return;
    }
    this.router.navigate(['/tabs/images'], {
      queryParams: this.buildQueryParams(0, tag)
    });
  }

  private syncUrl(pageIndex: number): void {
    this.router.navigate(['/tabs/images'], {
      queryParams: this.buildQueryParams(pageIndex),
      replaceUrl: true
    });
  }

  private buildQueryParams(pageIndex: number, tagOverride?: string): Record<string, string> {
    const tag = tagOverride !== undefined ? tagOverride : this.searchControl.value.trim();
    const onlyFavorites = this.favoritesControl.value;
    const queryParams: Record<string, string> = {};
    if (tag) {
      queryParams['tag'] = tag;
    }
    if (onlyFavorites) {
      queryParams['favorites'] = 'true';
    }
    if (pageIndex > 0) {
      queryParams['page'] = String(pageIndex + 1);
    }
    return queryParams;
  }

  private parsePageIndex(value: string | null): number {
    const page = Number(value);
    return Number.isInteger(page) && page > 1 ? page - 1 : 0;
  }

  private loadImages(pageIndex: number = this.pageIndex): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    this.service.getAll(this.searchControl.value.trim(), this.favoritesControl.value, pageIndex, this.pageSize).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: result => {
        this.images = result.items;
        this.total = result.total;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Load images error', err);
        this.errorMessage = 'Не удалось загрузить файлы';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private showUploadFeedback(result: UploadResult): void {
    let message: string;
    if (!result.wasDuplicate) {
      message = 'Файл загружен';
    } else if (result.addedTags.length > 0) {
      message = `Этот файл уже был загружен. Добавлены теги: ${result.addedTags.join(', ')}`;
    } else {
      message = 'Этот файл уже загружен';
    }
    this.snackBar.open(message, 'OK', { duration: 5000 });
  }

  private resetUploadForm(): void {
    this.selectedFile = null;
    this.uploadTags = [];
    this.tagInputControl.setValue('');
    this.tagSuggestions = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
