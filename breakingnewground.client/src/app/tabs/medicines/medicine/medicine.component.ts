import { afterNextRender, AfterViewInit, ChangeDetectorRef, Component, Injector } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, forkJoin, of, Subscription } from 'rxjs';

import { BaseEntityComponent } from '../base-entity/base-entity.component';

import { MedicineBodyType } from '../medicine-body-type/medicine-body-type.model';
import { MedicineBodyTypeService } from '../medicine-body-type/medicine-body-type.service';

import { MedicineType } from '../medicine-type/medicine-type.model';
import { MedicineTypeService } from '../medicine-type/medicine-type.service';

import { formatISO } from 'date-fns/formatISO';
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

  medicineBodyTypes: MedicineBodyType[] = [];
  medicineTypes: MedicineType[] = [];
  override originalItems: Medicine[] = [];

  isLoadingMedicine = true;

  private medicineDataSubscription?: Subscription;

  constructor(
    service: MedicineService,
    private medicineBodyTypeService: MedicineBodyTypeService,
    private medicineTypeService: MedicineTypeService,
    cdr: ChangeDetectorRef,
    private injector: Injector) {
    super(service,
      'Лекарства',
      new FormGroup({
        id: new FormControl(''),
        name: new FormControl(''),
        expirationDate: new FormControl(''),
        medicineBodyType: new FormControl(''),
        medicineType: new FormControl(''),
        count: new FormControl('', [Validators.min(0)]),
        comment: new FormControl('')
      }),
      cdr);
  }

  override ngAfterViewInit() {
    afterNextRender(() => this.loadAllData(), { injector: this.injector });
  }

  loadAllData() {
    this.isLoadingMedicine = true;

    forkJoin({
      medicineBodyTypes: this.getDataOnce(this.medicineBodyTypeService),
      medicineTypes: this.getDataOnce(this.medicineTypeService)
    }).subscribe({
      next: ({ medicineBodyTypes, medicineTypes }) => {
        const all = 'Все';
        this.medicineBodyTypes = medicineBodyTypes.items;
        this.medicineBodyTypes.unshift({ id: 0, name: all });
        this.filterForm.patchValue({ medicineBodyType: this.medicineBodyTypes[0].id });

        this.medicineTypes = medicineTypes.items;
        this.medicineTypes.unshift({ id: 0, name: all });
        this.filterForm.patchValue({ medicineType: this.medicineTypes[0].id });

        this.subscribeToMedicinesData();
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
