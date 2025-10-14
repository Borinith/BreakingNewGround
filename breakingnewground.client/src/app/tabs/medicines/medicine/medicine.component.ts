import { afterNextRender, AfterViewInit, ChangeDetectorRef, Component, Injector } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest } from 'rxjs';

import { BaseEntityComponent } from '../base-entity/base-entity.component';

import { MedicineBodyType } from '../medicine-body-type/medicine-body-type.model';
import { MedicineBodyTypeService } from '../medicine-body-type/medicine-body-type.service';

import { MedicineType } from '../medicine-type/medicine-type.model';
import { MedicineTypeService } from '../medicine-type/medicine-type.service';

import { formatISO } from 'date-fns/formatISO';
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

    combineLatest({
      medicines: this.setupDataStreamAndGetData(this.service, this.sort!, this.paginator!),
      medicineBodyTypes: this.setupDataStreamAndGetData(this.medicineBodyTypeService, null, null, true),
      medicineTypes: this.setupDataStreamAndGetData(this.medicineTypeService, null, null, true),
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

            this.setupDataStreamAndGetData(this.service, this.sort!, this.paginator!)
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
