import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicineBodyType } from './medicine-body-type.model';

@Injectable({
  providedIn: 'root'
})

export class MedicineBodyTypeService {
  private apiUrl = '/api/MedicineBodyType';

  constructor(private http: HttpClient) { }

  getAll(): Observable<MedicineBodyType[]> {
    return this.http.get<MedicineBodyType[]>(`${this.apiUrl}/GetAll`);
  }

  getById(id: number): Observable<MedicineBodyType> {
    return this.http.get<MedicineBodyType>(`${this.apiUrl}/GetById/${id}`);
  }

  create(medicineBodyType: MedicineBodyType): Observable<MedicineBodyType> {
    return this.http.post<MedicineBodyType>(`${this.apiUrl}/Create`, medicineBodyType);
  }

  update(medicineBodyType: MedicineBodyType): Observable<MedicineBodyType> {
    return this.http.put<MedicineBodyType>(`${this.apiUrl}/Update`, medicineBodyType);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/Delete/${id}`);
  }
}
