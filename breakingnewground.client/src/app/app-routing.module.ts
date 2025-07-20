import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MedicineBodyTypesComponent } from './tabs/medicines/medicine-body-type/medicine-body-types.component';
import { MedicineTypesComponent } from './tabs/medicines/medicine-type/medicine-types.component';
import { MedicineComponent } from './tabs/medicines/medicine/medicine.component';
import { MedicinesComponent } from './tabs/medicines/medicines.component';
import { TabsComponent } from './tabs/tabs.component';
import { WeatherForecastComponent } from './tabs/weatherforecast/weatherforecast.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'tabs',
    component: TabsComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'medicines',
        component: MedicinesComponent,
        children: [
          { path: 'medicines', component: MedicineComponent },
          { path: 'medicinebodytypes', component: MedicineBodyTypesComponent },
          { path: 'medicinetypes', component: MedicineTypesComponent },
          { path: '', redirectTo: 'medicines', pathMatch: 'full' },
          { path: '**', redirectTo: 'medicines' }
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
