import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { MedicinesComponent } from './medicines.component';
import { MedicineComponent } from './medicine/medicine.component';
import { MedicineBodyTypesComponent } from './medicine-body-type/medicine-body-types.component';
import { MedicineTypesComponent } from './medicine-type/medicine-types.component';


@NgModule({
  declarations: [
    MedicinesComponent,
    MedicineComponent,
    MedicineBodyTypesComponent,
    MedicineTypesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatSidenavModule,
    MatListModule,
    RouterModule,
    HttpClientModule
  ],
  exports: [
    MedicineComponent,
    MedicineBodyTypesComponent,
    MedicineTypesComponent
  ]
})
export class MedicinesModule { }
