import { Directive, OnInit, ChangeDetectorRef } from '@angular/core';
import { BaseEntityService } from './base-entity.service';

@Directive()
export abstract class BaseEntityComponent<T> implements OnInit {

  componentName: string;
  items: T[] = [];
  originalItems: any[] = [];
  newItem: T;
  isLoading = true;
  updatedId: number | null = null;
  errorId: number | null = null;

  constructor(
    protected service: BaseEntityService<T>,
    protected name: string,
    protected cdr: ChangeDetectorRef) {
    this.componentName = name;
    this.newItem = {} as T;
  }

  ngOnInit() {
    this.getAllItems();
  }

  getAllItems() {
    this.isLoading = true;

    this.service.getAll().subscribe(data => {
      this.items = data;
      this.originalItems = data.map(item => ({ ...item }));
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  addItem() {
    if (this.isValidAndNewItem(this.newItem)) {
      this.service.create(this.newItem).subscribe(() => {
        this.newItem = {} as T;
        this.getAllItems();
      });
    }
  }

  updateItem(item: T) {
    if (this.isValidAndNewItem(item)) {
      this.service.update(item)
        .subscribe({
          next: () => {
            this.updatedId = (item as any).id;
            this.cdr.detectChanges();

            setTimeout(() => {
              this.updatedId = null;
              this.cdr.detectChanges();

              this.getAllItems();
            }, 1000);
          },
          error: err => {
            console.error('Update error', err);
            this.showError(item);
          }
        });
    }
  }

  deleteItem(id: number) {
    this.service.delete(id).subscribe((isDeleted) => {
      if (isDeleted) {
        this.getAllItems()
      }
    });
  }

  private isValidAndNewItem(item: any): boolean {
    if (!item || !item.name || item.name.trim() === '') {
      console.warn('Invalid data');
      this.showError(item);
      return false;
    }

    if (this.originalItems.map(x => x.name).includes(item.name)) {
      console.log('Item with this name already exists');
      return false;
    }

    return true;
  }

  protected showError(item: any): void {
    this.errorId = item.id;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.errorId = null;
      this.cdr.detectChanges();
    }, 1000);
  }
}
