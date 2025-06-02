import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { MedicinesComponent } from './tabs/medicines/medicines.component';
import { WeatherForecastComponent } from './tabs/weatherforecast/weatherforecast.component';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsComponent,
    children: [
      { path: 'medicines', component: MedicinesComponent },
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
