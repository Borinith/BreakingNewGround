import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ImageDetailComponent } from './tabs/images/image-detail/image-detail.component';
import { ImagesComponent } from './tabs/images/images.component';
import { TagsListComponent } from './tabs/images/tags-list/tags-list.component';
import { MedicineBodyTypesComponent } from './tabs/medicines/medicine-body-type/medicine-body-types.component';
import { MedicineTypesComponent } from './tabs/medicines/medicine-type/medicine-types.component';
import { MedicineComponent } from './tabs/medicines/medicine/medicine.component';
import { MedicinesComponent } from './tabs/medicines/medicines.component';
import { TabsComponent } from './tabs/tabs.component';
import { WeatherForecastComponent } from './tabs/weatherforecast/weatherforecast.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Вход' },
  { path: 'register', component: RegisterComponent, title: 'Регистрация' },
  {
    path: 'tabs',
    component: TabsComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: 'weatherforecast', component: WeatherForecastComponent, title: 'Прогноз погоды' },
      {
        path: 'medicines',
        component: MedicinesComponent,
        children: [
          { path: 'medicines', component: MedicineComponent, title: 'Лекарства' },
          { path: 'medicinebodytypes', component: MedicineBodyTypesComponent, title: 'Категории' },
          { path: 'medicinetypes', component: MedicineTypesComponent, title: 'Типы лекарств' },
          { path: '', redirectTo: 'medicines', pathMatch: 'full' },
          { path: '**', redirectTo: 'medicines' }
        ]
      },
      { path: 'images', component: ImagesComponent, title: 'Картинки' },
      { path: 'images/tags', component: TagsListComponent, title: 'Все теги' },
      { path: 'images/:id', component: ImageDetailComponent, title: 'Картинки' },
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
