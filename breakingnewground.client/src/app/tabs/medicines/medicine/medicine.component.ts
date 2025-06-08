import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MedicineService } from './medicine.service';
import { Medicine } from './medicine.model';

@Component({
  selector: 'app-medicine',
  templateUrl: './medicine.component.html',
  standalone: false
})
export class MedicineComponent implements OnInit {
  medicines: Medicine[] = [];
  newMedicine: Medicine = {
    id: 0,
    name: '',
    expirationDate: new Date(),
    bodyTypeId: 0,
    typeId: 0,
    count: 0,
    comment: ''
  };

  constructor(private medicineService: MedicineService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.getAllMedicines();
  }

  getAllMedicines() {
    this.medicineService.getAll().subscribe(data => {
      this.medicines = data;
      this.cdr.detectChanges();
    });
  }

  addMedicine() {
    this.medicineService.create(this.newMedicine).subscribe(() => {
      this.newMedicine = {
        id: 0,
        name: '',
        expirationDate: new Date(),
        bodyTypeId: 0,
        typeId: 0,
        count: 0,
        comment: ''
      };
      this.getAllMedicines();
    });
  }

  updateMedicine(medicine: Medicine) {
    this.medicineService.update(medicine).subscribe(() => this.getAllMedicines());
  }

  deleteMedicine(id: number) {
    this.medicineService.delete(id).subscribe((isDeleted) => {
      if (isDeleted) {
        this.getAllMedicines()
      }
    });
  }
}
