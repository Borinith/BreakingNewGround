import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { BaseEntityComponent } from '../base-entity/base-entity.component';

import { MedicineBodyType } from '../medicine-body-type/medicine-body-type.model';
import { MedicineBodyTypeService } from '../medicine-body-type/medicine-body-type.service';

import { MedicineType } from '../medicine-type/medicine-type.model';
import { MedicineTypeService } from '../medicine-type/medicine-type.service';

import { Medicine } from './medicine.model';
import { MedicineService } from './medicine.service';
import { formatISO } from 'date-fns/formatISO';
import { GetRequest } from '../common-models/request.model';

@Component({
  selector: 'app-medicine',
  templateUrl: './medicine.component.html',
  standalone: false,
  styleUrls: ['./medicine.component.css', '../medicines.component.css']
})

export class MedicineComponent extends BaseEntityComponent<Medicine> implements OnInit {

  medicineBodyTypes: MedicineBodyType[] = [];
  medicineTypes: MedicineType[] = [];
  override originalItems: Medicine[] = [];

  isLoadingMedicine = true;

  constructor(
    service: MedicineService,
    private medicineBodyTypeService: MedicineBodyTypeService,
    private medicineTypeService: MedicineTypeService,
    cdr: ChangeDetectorRef) {
    super(service,
      'Лекарства',
      new FormGroup({
        id: new FormControl(''),
        name: new FormControl(''),
        expirationDate: new FormControl(''),
        medicineBodyType: new FormControl(''),
        medicineType: new FormControl(''),
        count: new FormControl(''),
        comment: new FormControl('')
      }),
      cdr);
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData() {
    const request: GetRequest = {
      filters: null,
      order: null,
      skip: null,
      take: null
    };

    this.isLoadingMedicine = true;

    forkJoin({
      medicines: this.service.getAll(request),
      medicineBodyTypes: this.medicineBodyTypeService.getAll(request),
      medicineTypes: this.medicineTypeService.getAll(request)
    }).subscribe({
      next: ({ medicines, medicineBodyTypes, medicineTypes }) => {
        this.items = medicines.items;
        this.originalItems = medicines.items.map(item => ({ ...item }));
        this.medicineBodyTypes = medicineBodyTypes.items;
        this.medicineTypes = medicineTypes.items;
        this.isLoadingMedicine = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ошибка загрузки данных', err);
        this.isLoadingMedicine = false;
      }
    });
  }

  loadMedicinesData() {
    const request: GetRequest = {
      filters: null,
      order: null,
      skip: null,
      take: null
    };

    this.isLoadingMedicine = true;

    this.service
      .getAll(request)
      .subscribe(medicines => {
        this.items = medicines.items;
        this.originalItems = medicines.items.map(item => ({ ...item }));
        this.isLoadingMedicine = false;
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

            this.loadMedicinesData();
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
