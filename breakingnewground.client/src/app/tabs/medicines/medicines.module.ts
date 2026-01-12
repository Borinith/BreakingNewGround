import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';

import { MedicineBodyTypesComponent } from './medicine-body-type/medicine-body-types.component';
import { MedicineTypesComponent } from './medicine-type/medicine-types.component';
import { MedicineComponent } from './medicine/medicine.component';
import { MedicinesComponent } from './medicines.component';

import { MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { enGB } from 'date-fns/locale';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { MY_DATE_FORMATS } from './date-formats';

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
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSortModule,
    MatTableModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    MedicineComponent,
    MedicineBodyTypesComponent,
    MedicineTypesComponent
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: enGB },
    provideDateFnsAdapter(),
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ]
})
export class MedicinesModule { }
