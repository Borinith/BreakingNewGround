import { Component, ChangeDetectorRef } from '@angular/core';
import { BaseEntityComponent } from '../base-entity/base-entity.component';
import { MedicineType } from './medicine-type.model';
import { MedicineTypeService } from './medicine-type.service';

@Component({
  selector: 'app-medicinetypes',
  templateUrl: '../base-entity/base-entity.component.html',
  standalone: false,
  styleUrls: ['../medicines.component.css']
})

export class MedicineTypesComponent extends BaseEntityComponent<MedicineType> {

  displayedColumns: string[] = ['id', 'name', 'actions'];

  constructor(service: MedicineTypeService, cdr: ChangeDetectorRef) {
    super(service, 'Типы лекарств', cdr);
  }
}
