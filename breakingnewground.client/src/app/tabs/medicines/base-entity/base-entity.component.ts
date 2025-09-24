import { AfterViewInit, ChangeDetectorRef, Directive, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, combineLatest, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { GetRequest, OrderByEnum, RequestComparisonEnum, RequestFilter, RequestOrder, ValueTypeEnum } from '../common-models/request.model';
import { BaseEntityService } from './base-entity.service';

@Directive()
export abstract class BaseEntityComponent<T> implements OnInit, AfterViewInit, OnDestroy {

  componentName: string;
  items: T[] = [];
  originalItems: any[] = [];
  newItem: T;
  isLoading = true;
  updatedId: number | null = null;
  errorId: number | null = null;
  total = 0;
  pageSize = 10;

  // form controls for header filters
  filterForm = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('')
  });

  private sort?: MatSort;
  private paginator?: MatPaginator;
  private initialized = false;

  // subjects for streaming events
  private refresh$ = new BehaviorSubject<void>(undefined);
  private destroy$ = new Subject<void>();

  @ViewChild(MatSort) private set matSort(ms: MatSort | null) {
    this.sort = ms ?? undefined;
    this.getAllItems();
  }
  @ViewChild(MatPaginator) private set matPaginator(pg: MatPaginator | null) {
    this.paginator = pg ?? undefined;
    this.getAllItems();
  }

  constructor(
    protected service: BaseEntityService<T>,
    protected name: string,
    protected cdr: ChangeDetectorRef) {
    this.componentName = name;
    this.newItem = {} as T;
  }

  private getAllItems() {
    this.isLoading = true;

    if (this.initialized) {
      return;
    }
    if (!this.sort || !this.paginator) {
      return;
    }

    this.initialized = true;
    this.cdr.detectChanges();

    this.setupDataStream(this.sort, this.paginator);
  }

  private setupDataStream(sort: MatSort, paginator: MatPaginator) {
    const sort$ = sort.sortChange.pipe(
      startWith({
        active: sort.active || 'Id',
        direction: sort.direction || 'asc'
      })
    );

    const page$ = paginator.page.pipe(
      startWith({
        pageIndex: paginator.pageIndex || 0,
        pageSize: paginator.pageSize || this.pageSize
      })
    );

    // поток фильтров — startWith нужен, чтобы сразу получить начальные значения
    const filters$ = this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      debounceTime(100),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      tap(() => {
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
      })
    );

    // combineLatest of: all filter values, sort, page, refresh$
    combineLatest([filters$, sort$, page$, this.refresh$])
      .pipe(
        takeUntil(this.destroy$),
        switchMap(([filterValues, sort, page]) => {
          const filtersArr: RequestFilter[] = this.buildFilters(filterValues);

          const request: GetRequest = {
            filters: filtersArr.length ? filtersArr : null,
            order: this.buildOrder(sort),
            skip: page.pageIndex * page.pageSize,
            take: page.pageSize
          };

          return this.service.getAll(request).pipe(
            catchError(err => {
              console.error('Get all items error', err);
              return of({ items: [], total: 0 });
            })
          );
        })
      ).subscribe(data => {
        this.items = data.items;
        this.originalItems = data.items.map(item => ({ ...item }));
        this.total = data.total;

        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  ngOnInit() { }

  ngAfterViewInit() {
    this.getAllItems();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildFilters(values: any): RequestFilter[] {
    const out: RequestFilter[] = [];

    if (values.id && values.id.toString().trim() !== '') {
      out.push({
        columnName: 'Id',
        valueType: ValueTypeEnum.Long,
        value: values.id.toString(),
        comparison: RequestComparisonEnum.Equal
      });
    }

    if (values.name && values.name.toString().trim() !== '') {
      out.push({
        columnName: 'Name',
        valueType: ValueTypeEnum.String,
        value: values.name.toString(),
        comparison: RequestComparisonEnum.TextStartsWith
      });
    }

    return out;
  }

  private buildOrder(sort: any): RequestOrder | null {
    if (!sort || !sort.active || sort.direction === '') {
      return null;
    }
    return {
      columnName: sort.active,
      orderBy: sort.direction === 'asc' ? OrderByEnum.Ascending : OrderByEnum.Descending
    };
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
