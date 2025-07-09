import { Directive, OnInit, ChangeDetectorRef } from '@angular/core';
import { BaseEntityService } from './base-entity.service';

@Directive()
export abstract class BaseEntityComponent<T> implements OnInit {

  componentName: string;
  items: T[] = [];
  originalItems: any[] = [];
  newItem: T;
  isLoading = true;

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
      this.service.update(item).subscribe(() => this.getAllItems());
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
      return false;
    }

    if (this.originalItems.map(x => x.name).includes(item.name)) {
      console.log('Item with this name already exists');
      return false;
    }

    return true;
  }
}
