import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { BaseEntityComponent } from '../base-entity/base-entity.component';

import { MedicineBodyType } from '../medicine-body-type/medicine-body-type.model';
import { MedicineBodyTypeService } from '../medicine-body-type/medicine-body-type.service';

import { MedicineType } from '../medicine-type/medicine-type.model';
import { MedicineTypeService } from '../medicine-type/medicine-type.service';

import { Medicine } from './medicine.model';
import { MedicineService } from './medicine.service';
import { formatISO } from 'date-fns/formatISO';

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

  override isLoading = true;

  constructor(
    service: MedicineService,
    private medicineBodyTypeService: MedicineBodyTypeService,
    private medicineTypeService: MedicineTypeService,
    cdr: ChangeDetectorRef) {
    super(service, 'Лекарства', cdr);
  }

  override ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData() {
    this.isLoading = true;

    forkJoin({
      medicines: this.service.getAll(),
      medicineBodyTypes: this.medicineBodyTypeService.getAll(),
      medicineTypes: this.medicineTypeService.getAll()
    }).subscribe({
      next: ({ medicines, medicineBodyTypes, medicineTypes }) => {
        this.items = medicines;
        this.originalItems = medicines.map(item => ({ ...item }));
        this.medicineBodyTypes = medicineBodyTypes;
        this.medicineTypes = medicineTypes;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ошибка загрузки данных', err);
        this.isLoading = false;
      }
    });
  }

  loadMedicinesData() {
    this.isLoading = true;

    this.service.getAll().subscribe(medicines => {
      this.items = medicines;
      this.originalItems = medicines.map(item => ({ ...item }));
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
      this.service.update(item).subscribe(() => this.loadMedicinesData());
    }
  }

  private isValidItem(item: Medicine): boolean {
    if (!item || !item.name || item.name.trim() === '') {
      console.warn('Invalid data');
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
