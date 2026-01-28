import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfirmDialogService } from '../../../dialog/confirm-dialog/confirm-dialog.service';
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

  constructor(service: MedicineTypeService, cdr: ChangeDetectorRef, confirmDialogService: ConfirmDialogService) {
    super(service,
      'Типы лекарств',
      new FormGroup({
        id: new FormControl(''),
        name: new FormControl('')
      }),
      cdr,
      confirmDialogService);
  }
}
