import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { JwtModule } from '@auth0/angular-jwt';

import { MatTabsModule } from '@angular/material/tabs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ConfirmDialogComponent } from './dialog/confirm-dialog/confirm-dialog.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { TabsComponent } from './tabs/tabs.component';
import { MedicinesModule } from './tabs/medicines/medicines.module'
import { WeatherForecastModule } from './tabs/weatherforecast/weatherforecast.module'

export function tokenGetter() {
  return localStorage.getItem('jwt');
}

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    ConfirmDialogComponent,
    LoginComponent,
    RegisterComponent,
    TabsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    AppRoutingModule,
    MedicinesModule,
    WeatherForecastModule,
    JwtModule.forRoot({ config: { tokenGetter } })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ]  
})
export class AppModule { }
