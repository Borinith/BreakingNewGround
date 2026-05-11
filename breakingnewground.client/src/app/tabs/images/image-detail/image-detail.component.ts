import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogService } from '../../../dialog/confirm-dialog/confirm-dialog.service';
import { ImageMetadata } from '../images.model';
import { ImagesService } from '../images.service';

@Component({
  selector: 'app-image-detail',
  templateUrl: './image-detail.component.html',
  standalone: false,
  styleUrls: ['./image-detail.component.css']
})
export class ImageDetailComponent implements OnInit {

  image: ImageMetadata | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private service: ImagesService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmDialogService: ConfirmDialogService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'Картинка не найдена';
      return;
    }

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
          ? 'Картинка не найдена'
          : 'Не удалось загрузить картинку';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  originalUrl(id: string): string {
    return this.service.originalUrl(id);
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
            next: () => this.router.navigate(['/tabs/images']),
            error: err => {
              console.error('Delete error', err);
              this.snackBar.open('Не удалось удалить картинку', 'OK', { duration: 5000 });
            }
          });
        }
      });
  }
}
