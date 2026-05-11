import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResult } from '../paged-result.model';
import { ImageMetadata, UploadResult } from './images.model';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  private readonly baseUrl = '/api/Image';

  constructor(private http: HttpClient) { }

  getAll(query: string, page: number, pageSize: number): Observable<PagedResult<ImageMetadata>> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (query) {
      params = params.set('query', query);
    }

    return this.http.get<PagedResult<ImageMetadata>>(`${this.baseUrl}/GetAll`, { params });
  }

  upload(file: File, tags: string[]): Observable<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    for (const tag of tags) {
      formData.append('tags', tag);
    }

    return this.http.post<UploadResult>(`${this.baseUrl}/Upload`, formData);
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/Delete/${id}`);
  }

  suggestTags(query: string): Observable<string[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<string[]>(`${this.baseUrl}/SuggestTags`, { params });
  }

  thumbnailUrl(id: string): string {
    return `${this.baseUrl}/GetThumbnail/${id}`;
  }

  originalUrl(id: string): string {
    return `${this.baseUrl}/GetOriginal/${id}`;
  }
}
