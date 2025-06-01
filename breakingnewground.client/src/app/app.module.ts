import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { MatTabsModule } from '@angular/material/tabs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { TabsComponent } from './tabs/tabs.component';
import { WeatherForecastComponent } from './tabs/weatherforecast/weatherforecast.component';
import { MedicinesComponent } from './tabs/medicines/medicines.component';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent, TabsComponent, WeatherForecastComponent, MedicinesComponent],
  imports: [BrowserModule, BrowserAnimationsModule, MatTabsModule, HttpClientModule, AppRoutingModule, FormsModule],
  providers: []  
})
export class AppModule { }
