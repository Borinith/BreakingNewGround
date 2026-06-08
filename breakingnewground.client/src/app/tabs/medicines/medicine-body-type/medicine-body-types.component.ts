import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfirmDialogService } from '../../../dialog/confirm-dialog/confirm-dialog.service';
import { BaseEntityComponent } from '../base-entity/base-entity.component';
import { MedicineBodyType } from './medicine-body-type.model';
import { MedicineBodyTypeService } from './medicine-body-type.service';

@Component({
  selector: 'app-medicinebodytypes',
  templateUrl: '../base-entity/base-entity.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['../medicines.component.css']
})

export class MedicineBodyTypesComponent extends BaseEntityComponent<MedicineBodyType> {

  displayedColumns: string[] = ['id', 'name', 'actions'];

  constructor(service: MedicineBodyTypeService, cdr: ChangeDetectorRef, confirmDialogService: ConfirmDialogService) {
    super(service,
      'Категории',
      new FormGroup({
        id: new FormControl(''),
        name: new FormControl('')
      }),
      cdr,
      confirmDialogService);
  }
}
