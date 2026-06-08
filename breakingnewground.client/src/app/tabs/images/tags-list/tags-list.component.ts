import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Tag } from '../images.model';
import { ImagesService } from '../images.service';

@Component({
  selector: 'app-tags-list',
  templateUrl: './tags-list.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./tags-list.component.css']
})
export class TagsListComponent implements OnInit {

  tags: Tag[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private service: ImagesService,
    private cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.service.getAllTags().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: tags => {
        this.tags = tags;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: err => {
        console.error('Load tags error', err);
        this.errorMessage = 'Не удалось загрузить теги';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
