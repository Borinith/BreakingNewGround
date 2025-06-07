import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatTabsModule } from '@angular/material/tabs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { TabsComponent } from './tabs/tabs.component';
import { WeatherForecastComponent } from './tabs/weatherforecast/weatherforecast.component';
import { MedicinesModule } from './tabs/medicines/medicines.module'

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    TabsComponent,
    WeatherForecastComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatTabsModule,
    AppRoutingModule,
    MedicinesModule
  ],
  providers: []  
})
export class AppModule { }
