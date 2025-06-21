import { Directive, OnInit, ChangeDetectorRef } from '@angular/core';
import { BaseEntityService } from './base-entity.service';

@Directive()
export abstract class BaseEntityComponent<T> implements OnInit {

  componentName: string;
  items: T[] = [];
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
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  addItem() {
    this.service.create(this.newItem).subscribe(() => {
      this.newItem = {} as T;
      this.getAllItems();
    });
  }

  updateItem(item: T) {
    this.service.update(item).subscribe(() => this.getAllItems());
  }

  deleteItem(id: number) {
    this.service.delete(id).subscribe((isDeleted) => {
      if (isDeleted) {
        this.getAllItems()
      }
    });
  }
}
