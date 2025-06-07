import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicineType } from './medicine-type.model';

@Injectable({
  providedIn: 'root'
})

export class MedicineTypeService {
  private apiUrl = '/api/MedicineType';

  constructor(private http: HttpClient) { }

  getAll(): Observable<MedicineType[]> {
    return this.http.get<MedicineType[]>(`${this.apiUrl}/GetAll`);
  }

  getById(id: number): Observable<MedicineType> {
    return this.http.get<MedicineType>(`${this.apiUrl}/GetById/${id}`);
  }

  create(product: MedicineType): Observable<MedicineType> {
    return this.http.post<MedicineType>(`${this.apiUrl}/Create`, product);
  }

  update(product: MedicineType): Observable<MedicineType> {
    return this.http.put<MedicineType>(`${this.apiUrl}/Update`, product);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/Delete/${id}`);
  }
}
