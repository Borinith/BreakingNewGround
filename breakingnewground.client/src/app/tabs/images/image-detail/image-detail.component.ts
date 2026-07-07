import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Location } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { ConfirmDialogService } from '../../../dialog/confirm-dialog/confirm-dialog.service';
import { ImageMetadata } from '../images.model';
import { ImagesService } from '../images.service';

@Component({
  selector: 'app-image-detail',
  templateUrl: './image-detail.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./image-detail.component.css']
})
export class ImageDetailComponent implements OnInit {

  readonly separatorKeyCodes: readonly number[] = [ENTER, COMMA];

  @ViewChild('tagInput') tagInput?: ElementRef<HTMLInputElement>;

  image: ImageMetadata | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  tagInputControl = new FormControl<string>('', { nonNullable: true });
  tagSuggestions: string[] = [];

  constructor(
    private service: ImagesService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private confirmDialogService: ConfirmDialogService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef) { }

  goBack(): void {
    this.location.back();
  }

  originalUrl(id: string): string {
    return this.service.getOriginalUrl(id);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Файл не найден';
      return;
    }

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
      const currentTags = this.image?.tags ?? [];
      this.tagSuggestions = suggestions.filter(s =>
        !currentTags.some(t => t.toLowerCase() === s.toLowerCase()));
      this.cdr.detectChanges();
    });

    this.loadImage(id);
  }

  addTagFromInput(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    this.addTag(value);
    event.chipInput?.clear();
    this.tagInputControl.setValue('');
  }

  addTagFromAutocomplete(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value as string;
    this.addTag(value);
    if (this.tagInput) {
      this.tagInput.nativeElement.value = '';
    }
    this.tagInputControl.setValue('');
  }

  removeTag(tag: string): void {
    if (!this.image) {
      return;
    }
    const newTags = this.image.tags.filter(t => t !== tag);
    this.commitTags(newTags);
  }

  toggleFavorite(): void {
    if (!this.image) {
      return;
    }

    const id = this.image.id;
    const newValue = !this.image.isFavorite;

    this.service.setFavorite(id, newValue).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: updated => {
        this.image = updated;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Set favorite error', err);
        this.snackBar.open('Не удалось обновить избранное', 'OK', { duration: 5000 });
        this.loadImage(id);
      }
    });
  }

  delete(): void {
    if (!this.image) {
      return;
    }

    const id = this.image.id;

    this.confirmDialogService.openConfirmDialog()
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result) {
          this.service.delete(id).pipe(
            takeUntilDestroyed(this.destroyRef)
          ).subscribe({
            next: () => {
              this.router.navigate(['/tabs/images']);
              this.snackBar.open('Файл удалён', 'OK', { duration: 5000 });
            },
            error: err => {
              console.error('Delete error', err);
              this.snackBar.open('Не удалось удалить файл', 'OK', { duration: 5000 });
            }
          });
        }
      });
  }

  private addTag(value: string): void {
    if (!value || !this.image) {
      return;
    }
    if (this.image.tags.some(t => t.toLowerCase() === value.toLowerCase())) {
      return;
    }
    const newTags = [...this.image.tags, value];
    this.commitTags(newTags);
  }

  private commitTags(newTags: string[]): void {
    if (!this.image) {
      return;
    }
    const id = this.image.id;

    this.service.setTags(id, newTags).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: updated => {
        this.image = updated;
        this.tagSuggestions = [];
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Set tags error', err);
        this.snackBar.open('Не удалось обновить теги', 'OK', { duration: 5000 });
        this.loadImage(id);
      }
    });
  }

  private loadImage(id: string): void {
    this.isLoading = true;
    this.service.getById(id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: image => {
        this.image = image;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Load image error', err);
        this.errorMessage = err.status === 404
          ? 'Файл не найден'
          : 'Не удалось загрузить файл';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
