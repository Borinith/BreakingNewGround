import { afterNextRender, AfterViewInit, ChangeDetectorRef, Component, Injector } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseEntityComponent } from '../base-entity/base-entity.component';

import { MedicineBodyType } from '../medicine-body-type/medicine-body-type.model';
import { MedicineBodyTypeService } from '../medicine-body-type/medicine-body-type.service';

import { MedicineType } from '../medicine-type/medicine-type.model';
import { MedicineTypeService } from '../medicine-type/medicine-type.service';

import { formatISO } from 'date-fns/formatISO';
import { ConfirmDialogService } from '../../../dialog/confirm-dialog/confirm-dialog.service';
import { BaseEntityService } from '../base-entity/base-entity.service';
import { Medicine } from './medicine.model';
import { MedicineService } from './medicine.service';

@Component({
  selector: 'app-medicine',
  templateUrl: './medicine.component.html',
  standalone: false,
  styleUrls: ['./medicine.component.css', '../medicines.component.css']
})

export class MedicineComponent extends BaseEntityComponent<Medicine> implements AfterViewInit {

  private static readonly ALL_OPTION_ID = 0;
  private static readonly ALL_OPTION_NAME = 'Все';

  medicineBodyTypes: MedicineBodyType[] = [{ id: MedicineComponent.ALL_OPTION_ID, name: MedicineComponent.ALL_OPTION_NAME }];
  medicineTypes: MedicineType[] = [{ id: MedicineComponent.ALL_OPTION_ID, name: MedicineComponent.ALL_OPTION_NAME }];
  override originalItems: Medicine[] = [];

  isLoadingMedicine = true;

  private medicineDataSubscription?: Subscription;

  constructor(
    service: MedicineService,
    private medicineBodyTypeService: MedicineBodyTypeService,
    private medicineTypeService: MedicineTypeService,
    cdr: ChangeDetectorRef,
    confirmDialogService: ConfirmDialogService,
    private injector: Injector) {
    super(service,
      'Лекарства',
      new FormGroup({
        id: new FormControl(''),
        name: new FormControl(''),
        expirationDate: new FormControl(''),
        medicineBodyType: new FormControl<number>(MedicineComponent.ALL_OPTION_ID),
        medicineType: new FormControl<number>(MedicineComponent.ALL_OPTION_ID),
        count: new FormControl('', [Validators.min(0)]),
        comment: new FormControl('')
      }),
      cdr,
      confirmDialogService);
  }

  override ngAfterViewInit() {
    afterNextRender(() => this.loadAllData(), { injector: this.injector });
  }

  loadAllData() {
    this.isLoadingMedicine = true;
    this.subscribeToMedicinesData();

    forkJoin({
      medicineBodyTypes: this.getDataOnce(this.medicineBodyTypeService),
      medicineTypes: this.getDataOnce(this.medicineTypeService)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
      next: ({ medicineBodyTypes, medicineTypes }) => {
        const allBodyType: MedicineBodyType = { id: MedicineComponent.ALL_OPTION_ID, name: MedicineComponent.ALL_OPTION_NAME };
        const allType: MedicineType = { id: MedicineComponent.ALL_OPTION_ID, name: MedicineComponent.ALL_OPTION_NAME };
        this.medicineBodyTypes = [allBodyType, ...medicineBodyTypes.items];
        this.medicineTypes = [allType, ...medicineTypes.items];

        this.isLoadingMedicine = false;
        this.cdr.detectChanges();
      }
    });
  }

  private getDataOnce<T>(service: BaseEntityService<T>) {
    return service.getAll({
      filters: null,
      order: null,
      skip: null,
      take: null
    }).pipe(
      catchError(err => {
        console.error('Get all items error', err);
        return of({ items: [], total: 0 });
      })
    );
  }

  private subscribeToMedicinesData() {
    if (this.medicineDataSubscription) {
      this.medicineDataSubscription.unsubscribe();
    }

    this.medicineDataSubscription = this.setupDataStreamAndGetData(this.service, this.sort!, this.paginator!)
      .subscribe(medicines => {
        this.items = medicines.items;
        this.originalItems = medicines.items.map(item => ({ ...item }));
        this.total = medicines.total;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  formatDate(e: any): void {
    this.newItem.expirationDate = formatISO(e.target.value, { representation: 'date' });
  }

  onDateChange(medicine: Medicine, date: Date | null) {
    if (!date) {
      return;
    }

    medicine.expirationDate = formatISO(date, { representation: 'date' });
    this.updateItem(medicine);
  }

  override updateItem(item: Medicine) {
    if (this.isValidItem(item)) {
      this.service.update(item).subscribe({
        next: () => {
          this.updatedId = item.id;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.updatedId = null;
            this.cdr.detectChanges();

            /*if (this.updateSubscription) {
              this.updateSubscription.unsubscribe();
            }

            this.updateSubscription = this.setupDataStreamAndGetData(this.service, this.sort!, this.paginator!)
              .subscribe(medicines => {
                this.items = medicines.items;
                this.originalItems = medicines.items.map(item => ({ ...item }));
                this.total = medicines.total;
                this.cdr.detectChanges();
              });*/
          }, 1000);
        },
        error: err => {
          console.error('Update error', err);
          this.showError(item);
        }
      });
    }
  }

  private isValidItem(item: Medicine): boolean {
    if (!item || !item.name || item.name.trim() === '') {
      console.warn('Invalid data');
      this.showError(item);
      return false;
    }

    item.count = item.count < 0 ? 0 : item.count;
    item.comment = (item.comment?.trim() === '') ? null : item.comment;

    const originalItem = this.originalItems.find(x => x.id == item.id);

    if ((originalItem === undefined)
      || (originalItem.name == item.name
        && originalItem.expirationDate == item.expirationDate
        && originalItem.bodyTypeId == item.bodyTypeId
        && originalItem.typeId == item.typeId
        && originalItem.count == item.count
        && originalItem.comment == item.comment)
    ) {
      console.log('This item already exists');
      return false;
    }

    return true;
  }
}
