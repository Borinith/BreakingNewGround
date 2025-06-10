import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseEntityService } from '../base-entity/base-entity.service';
import { MedicineType } from './medicine-type.model';

@Injectable({
  providedIn: 'root'
})

export class MedicineTypeService extends BaseEntityService<MedicineType> {

  constructor(http: HttpClient) {
    super(http, '/api/MedicineType');
  }
}
