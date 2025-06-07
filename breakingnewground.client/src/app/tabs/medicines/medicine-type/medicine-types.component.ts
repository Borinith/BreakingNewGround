import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MedicineTypeService } from './medicine-type.service';
import { MedicineType } from './medicine-type.model';

@Component({
  selector: 'app-medicinetypes',
  templateUrl: './medicine-types.component.html',
  standalone: false,
})
export class MedicineTypesComponent implements OnInit {
  medicineTypes: MedicineType[] = [];
  newMedicineType: MedicineType = { id: 0, name: '' };

  constructor(private medicineTypeService: MedicineTypeService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.getAllMedicineTypes();
  }

  getAllMedicineTypes() {
    this.medicineTypeService.getAll().subscribe(data => {
      this.medicineTypes = data;
      this.cdr.detectChanges();
    });
  }

  addMedicineType() {
    this.medicineTypeService.create(this.newMedicineType).subscribe(() => {
      this.newMedicineType = { id: 0, name: '' };
      this.getAllMedicineTypes();
    });
  }

  updateMedicineType(medicineType: MedicineType) {
    this.medicineTypeService.update(medicineType).subscribe(() => this.getAllMedicineTypes());
  }

  deleteMedicineType(id: number) {
    this.medicineTypeService.delete(id).subscribe((isDeleted) => {
      if (isDeleted) {
        this.getAllMedicineTypes()
      }
    });
  }
}
