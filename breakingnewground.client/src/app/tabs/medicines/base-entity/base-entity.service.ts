import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export class BaseEntityService<T> {

  constructor(protected http: HttpClient, protected apiUrl: string) {}

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(`${this.apiUrl}/GetAll`);
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/GetById/${id}`);
  }

  create(item: T): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/Create`, item);
  }

  update(item: T): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/Update`, item);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/Delete/${id}`);
  }
}
