import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

import { BaseEntityComponent } from '../base-entity/base-entity.component';

import { MedicineBodyType } from '../medicine-body-type/medicine-body-type.model';
import { MedicineBodyTypeService } from '../medicine-body-type/medicine-body-type.service';

import { MedicineType } from '../medicine-type/medicine-type.model';
import { MedicineTypeService } from '../medicine-type/medicine-type.service';

import { Medicine } from './medicine.model';
import { MedicineService } from './medicine.service';

@Component({
  selector: 'app-medicine',
  templateUrl: './medicine.component.html',
  standalone: false,
  styleUrls: ['./medicine.component.css', '../medicines.component.css']
})

export class MedicineComponent extends BaseEntityComponent<Medicine> implements OnInit {

  medicineBodyTypes: MedicineBodyType[] = [];
  medicineTypes: MedicineType[] = [];

  override isLoading = true;

  constructor(
    service: MedicineService,
    private medicineBodyTypeService: MedicineBodyTypeService,
    private medicineTypeService: MedicineTypeService,
    cdr: ChangeDetectorRef) {
    super(service, 'Medicines', cdr);
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

  getMedicineBodyType(id: number): string {
    const medicineBodyType = this.medicineBodyTypes.find(x => x.id === id);
    return medicineBodyType ? medicineBodyType.name : '—';
  }

  getMedicineType(id: number): string {
    const medicineType = this.medicineTypes.find(x => x.id === id);
    return medicineType ? medicineType.name : '—';
  }
}
