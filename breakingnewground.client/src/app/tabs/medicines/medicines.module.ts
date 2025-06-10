import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';

import { MedicineBodyTypesComponent } from './medicine-body-type/medicine-body-types.component';
import { MedicineTypesComponent } from './medicine-type/medicine-types.component';
import { MedicineComponent } from './medicine/medicine.component';
import { MedicinesComponent } from './medicines.component';


@NgModule({
  declarations: [
    MedicinesComponent,
    MedicineComponent,
    MedicineBodyTypesComponent,
    MedicineTypesComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatSidenavModule,
    MatTableModule,
    RouterModule
  ],
  exports: [
    MedicineComponent,
    MedicineBodyTypesComponent,
    MedicineTypesComponent
  ]
})
export class MedicinesModule { }
