import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medicine } from './medicine.model';

@Injectable({
  providedIn: 'root'
})

export class MedicineService {
  private apiUrl = '/api/Medicine';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(`${this.apiUrl}/GetAll`);
  }

  getById(id: number): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.apiUrl}/GetById/${id}`);
  }

  create(medicine: Medicine): Observable<Medicine> {
    return this.http.post<Medicine>(`${this.apiUrl}/Create`, medicine);
  }

  update(medicine: Medicine): Observable<Medicine> {
    return this.http.put<Medicine>(`${this.apiUrl}/Update`, medicine);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/Delete/${id}`);
  }
}
