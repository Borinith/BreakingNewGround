import { Component, ChangeDetectorRef } from '@angular/core';
import { BaseEntityComponent } from '../base-entity/base-entity.component';
import { MedicineBodyType } from './medicine-body-type.model';
import { MedicineBodyTypeService } from './medicine-body-type.service';

@Component({
  selector: 'app-medicinebodytypes',
  templateUrl: '../base-entity/base-entity.component.html',
  standalone: false,
  styleUrls: ['../medicines.component.css']
})

export class MedicineBodyTypesComponent extends BaseEntityComponent<MedicineBodyType> {

  displayedColumns: string[] = ['id', 'name', 'actions'];

  constructor(service: MedicineBodyTypeService, cdr: ChangeDetectorRef) {
    super(service, 'Категории', cdr);
  }
}
