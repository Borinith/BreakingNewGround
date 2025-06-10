import { Component, ChangeDetectorRef } from '@angular/core';
import { BaseEntityComponent } from '../base-entity/base-entity.component';
import { Medicine } from './medicine.model';
import { MedicineService } from './medicine.service';

@Component({
  selector: 'app-medicine',
  templateUrl: '../base-entity/base-entity.component.html',
  standalone: false
})

export class MedicineComponent extends BaseEntityComponent<Medicine> {

  displayedColumns: string[] = ['id', 'name', 'actions'];

  constructor(service: MedicineService, cdr: ChangeDetectorRef) {
    super(service, 'Medicines', cdr);
  }
}
