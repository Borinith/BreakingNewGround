import { AfterViewInit, ChangeDetectorRef, Directive, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { EMPTY, Observable, Subject, Subscription, combineLatest, merge, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ConfirmDialogService } from '../../../dialog/confirm-dialog/confirm-dialog.service';
import { PagedResult } from '../common-models/paged-result.model';
import { GetRequest, OrderByEnum, RequestComparisonEnum, RequestFilter, RequestOrder, ValueTypeEnum } from '../common-models/request.model';
import { BaseEntityService } from './base-entity.service';

@Directive()
export abstract class BaseEntityComponent<T> implements AfterViewInit, OnDestroy {

  componentName: string;
  items: T[] = [];
  originalItems: any[] = [];
  newItem: T;
  isLoading = true;
  updatedId: number | null = null;
  errorId: number | null = null;
  total = 0;
  pageSize = 10;

  protected sort?: MatSort;
  protected paginator?: MatPaginator;
  private initialized = false;

  // subjects for streaming events
  private dataSubscription?: Subscription;
  protected destroy$ = new Subject<void>();
  private resetPage$ = new Subject<void>();

  @ViewChild(MatSort) private set matSort(ms: MatSort | null) {
    this.sort = ms ?? undefined;
  }
  @ViewChild(MatPaginator) private set matPaginator(pg: MatPaginator | null) {
    this.paginator = pg ?? undefined;
  }

  constructor(
    protected service: BaseEntityService<T>,
    protected name: string,
    protected filterForm: FormGroup,
    protected cdr: ChangeDetectorRef,
    protected confirmDialogService: ConfirmDialogService) {
    this.componentName = name;
    this.newItem = {} as T;
  }

  private getAllItems() {
    if (this.initialized) {
      return;
    }
    if (!this.sort || !this.paginator) {
      return;
    }

    this.isLoading = true;
    this.initialized = true;
    this.cdr.detectChanges();

    this.subscribeData(this.service, this.sort, this.paginator);
  }

  private subscribeData(service: BaseEntityService<T>, sort: MatSort, paginator: MatPaginator) {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    this.dataSubscription = this.setupDataStreamAndGetData(service, sort, paginator)
      .subscribe(data => {
        this.items = data.items;
        this.originalItems = data.items.map(item => ({ ...item }));
        this.total = data.total;

        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  protected setupDataStreamAndGetData<T>(
    service: BaseEntityService<T>,
    sort: MatSort | null,
    paginator: MatPaginator | null,
    getAllData = false): Observable<PagedResult<T>> {
    const sort$ = sort?.sortChange.asObservable() || EMPTY;

    const filters$ = this.filterForm.valueChanges.pipe(
      debounceTime(100),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      tap(() => {
        if (this.paginator) {
          this.paginator.pageIndex = 0;
          this.resetPage$.next();
        }
      })
    );

    const page$ = merge(
      this.paginator?.page.asObservable() || EMPTY,
      this.resetPage$.pipe(
        map(() => ({
          pageIndex: 0,
          pageSize: this.paginator?.pageSize || this.pageSize
        }))
      )
    );

    return combineLatest([
      filters$.pipe(startWith(this.filterForm.value)),
      sort$.pipe(startWith({ active: sort?.active, direction: sort?.direction })),
      page$.pipe(startWith({ pageIndex: paginator?.pageIndex || 0, pageSize: paginator?.pageSize || this.pageSize }))
    ]).pipe(
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      takeUntil(this.destroy$),
      switchMap(([filters, sort, page]) => {
        const filtersArr: RequestFilter[] = this.buildFilters(filters);
        const request: GetRequest = getAllData
          ? {
            filters: null,
            order: null,
            skip: null,
            take: null
          }
          : {
            filters: filtersArr.length ? filtersArr : null,
            order: this.buildOrder(sort),
            skip: page.pageIndex * page.pageSize,
            take: page.pageSize
          };

        return service.getAll(request).pipe(
          catchError(err => {
            console.error('Get all items error', err);
            return of({ items: [], total: 0 });
          })
        );
      })
    );
  }

  ngAfterViewInit() {
    this.getAllItems();
  }

  ngOnDestroy() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

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

    if (values.expirationDate && values.expirationDate.toString().trim() !== '') {
      out.push({
        columnName: 'ExpirationDate',
        valueType: ValueTypeEnum.DateTime,
        value: values.expirationDate,
        comparison: RequestComparisonEnum.Equal //todo
      });
    }

    if (values.medicineBodyType && values.medicineBodyType.toString().trim() !== '') {
      out.push({
        columnName: 'BodyTypeId',
        valueType: ValueTypeEnum.Long,
        value: values.medicineBodyType.toString(),
        comparison: RequestComparisonEnum.Equal
      });
    }

    if (values.medicineType && values.medicineType.toString().trim() !== '') {
      out.push({
        columnName: 'TypeId',
        valueType: ValueTypeEnum.Long,
        value: values.medicineType.toString(),
        comparison: RequestComparisonEnum.Equal
      });
    }

    if (values.count && values.count.toString().trim() !== '') {
      out.push({
        columnName: 'Count',
        valueType: ValueTypeEnum.Integer,
        value: values.count.toString(),
        comparison: RequestComparisonEnum.Equal
      });
    }

    if (values.comment && values.comment.toString().trim() !== '') {
      out.push({
        columnName: 'Comment',
        valueType: ValueTypeEnum.String,
        value: values.comment.toString(),
        comparison: RequestComparisonEnum.TextStartsWith
      });
    }

    return out;
  }

  private buildOrder(sort: any): RequestOrder | null {
    if (!sort || !sort.active || sort.direction === '') {
      return null;
    }

    const isComplexSort = sort.active === 'BodyTypeId' || sort.active === 'TypeId';
    let joinTableName = null;
    let joinTableColumnName = null;

    if (sort.active === 'BodyTypeId') {
      joinTableName = 'MedicineBodyTypes';
      joinTableColumnName = 'Name';
    }
    else if (sort.active === 'TypeId') {
      joinTableName = 'MedicineTypes';
      joinTableColumnName = 'Name';
    }

    return {
      columnName: sort.active,
      orderBy: sort.direction === 'asc' ? OrderByEnum.Ascending : OrderByEnum.Descending,
      isComplexSort: isComplexSort,
      joinTableName: joinTableName,
      joinTableColumnName: joinTableColumnName
    };
  }

  addItem() {
    if (this.isValidAndNewItem(this.newItem)) {
      this.service.create(this.newItem).subscribe(() => {
        this.newItem = {} as T;
        this.initialized = false;
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

              this.initialized = false;
              //this.getAllItems();
            }, 1000);
          },
          error: err => {
            console.error('Update error', err);
            this.showError(item);
          }
        });
    }
  }

  openDeleteConfirm(id: number) {
    this.confirmDialogService.openConfirmDialog()
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.deleteItem(id);
        }
      });
  }

  deleteItem(id: number) {
    this.service.delete(id).subscribe((isDeleted) => {
      if (isDeleted) {
        this.initialized = false;
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
