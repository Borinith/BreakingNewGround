import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { WeatherForecastComponent } from './tabs/weatherforecast/weatherforecast.component';
import { MedicinesComponent } from './tabs/medicines/medicines.component';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsComponent,
    children: [
      { path: 'weatherforecast', component: WeatherForecastComponent },
      { path: 'medicines', component: MedicinesComponent },      
      { path: '', redirectTo: 'weatherforecast', pathMatch: 'full' },
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
