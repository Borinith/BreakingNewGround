import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseEntityService } from '../base-entity/base-entity.service';
import { Medicine } from './medicine.model';

@Injectable({
  providedIn: 'root'
})

export class MedicineService extends BaseEntityService<Medicine> {

  constructor(http: HttpClient) {
    super(http, '/api/Medicine');
  }
}
