import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseEntityService } from '../base-entity/base-entity.service';
import { MedicineBodyType } from './medicine-body-type.model';

@Injectable({
  providedIn: 'root'
})

export class MedicineBodyTypeService extends BaseEntityService<MedicineBodyType> {

  constructor(http: HttpClient) {
    super(http, '/api/MedicineBodyType');
  }
}
