import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { MedicinesComponent } from './tabs/medicines/medicines.component';
import { WeatherForecastComponent } from './tabs/weatherforecast/weatherforecast.component';
import { MedicineBodyTypesComponent } from './tabs/medicines/medicine-body-type/medicine-body-types.component';
import { MedicineTypesComponent } from './tabs/medicines/medicine-type/medicine-types.component';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsComponent,
    children: [
      {
        path: 'medicines',
        component: MedicinesComponent,
        children: [
          { path: 'medicinebodytypes', component: MedicineBodyTypesComponent },
          { path: 'medicinetypes', component: MedicineTypesComponent },
          { path: '', redirectTo: 'medicinebodytypes', pathMatch: 'full' },
          { path: '**', redirectTo: 'medicinebodytypes' }
        ]
      },
      { path: 'weatherforecast', component: WeatherForecastComponent },
      { path: '', redirectTo: 'medicines', pathMatch: 'full' },
    ]
  },
  { path: '', redirectTo: '/tabs', pathMatch: 'full' },
  { path: '**', redirectTo: '/tabs' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
