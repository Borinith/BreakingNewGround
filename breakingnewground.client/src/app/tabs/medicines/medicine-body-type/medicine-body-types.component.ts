import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MedicineBodyTypeService } from './medicine-body-type.service';
import { MedicineBodyType } from './medicine-body-type.model';

@Component({
  selector: 'app-medicinebodytypes',
  templateUrl: './medicine-body-types.component.html',
  standalone: false
})
export class MedicineBodyTypesComponent implements OnInit {
  medicineBodyTypes: MedicineBodyType[] = [];
  newMedicineBodyType: MedicineBodyType = { id: 0, name: '' };

  constructor(private medicineBodyTypeService: MedicineBodyTypeService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.getAllMedicineBodyTypes();
  }

  getAllMedicineBodyTypes() {
    this.medicineBodyTypeService.getAll().subscribe(data => {
      this.medicineBodyTypes = data;
      this.cdr.detectChanges();
    });
  }

  addMedicineBodyType() {
    this.medicineBodyTypeService.create(this.newMedicineBodyType).subscribe(() => {
      this.newMedicineBodyType = { id: 0, name: '' };
      this.getAllMedicineBodyTypes();
    });
  }

  updateMedicineBodyType(medicineBodyType: MedicineBodyType) {
    this.medicineBodyTypeService.update(medicineBodyType).subscribe(() => this.getAllMedicineBodyTypes());
  }

  deleteMedicineBodyType(id: number) {
    this.medicineBodyTypeService.delete(id).subscribe((isDeleted) => {
      if (isDeleted) {
        this.getAllMedicineBodyTypes()
      }
    });
  }
}
