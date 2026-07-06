import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResult } from '../paged-result.model';
import { ImageMetadata, Tag, UploadResult } from './images.model';

@Injectable({
  providedIn: 'root'
})
export class ImagesService {

  private readonly baseUrl = '/api/Image';

  constructor(private http: HttpClient) { }

  getAll(query: string, onlyFavorites: boolean, page: number, pageSize: number): Observable<PagedResult<ImageMetadata>> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (query) {
      params = params.set('query', query);
    }

    if (onlyFavorites) {
      params = params.set('onlyFavorites', 'true');
    }

    return this.http.get<PagedResult<ImageMetadata>>(`${this.baseUrl}/GetAll`, { params });
  }

  upload(file: File, tags: string[], thumbnail?: Blob): Observable<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    for (const tag of tags) {
      formData.append('tags', tag);
    }

    if (thumbnail) {
      formData.append('thumbnail', thumbnail, 'poster.jpg');
    }

    return this.http.post<UploadResult>(`${this.baseUrl}/Upload`, formData);
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/Delete/${id}`);
  }

  getById(id: string): Observable<ImageMetadata> {
    return this.http.get<ImageMetadata>(`${this.baseUrl}/GetById/${id}`);
  }

  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/GetAllTags`);
  }

  setTags(id: string, tags: string[]): Observable<ImageMetadata> {
    return this.http.put<ImageMetadata>(`${this.baseUrl}/SetTags/${id}`, tags);
  }

  setFavorite(id: string, isFavorite: boolean): Observable<ImageMetadata> {
    const params = new HttpParams().set('isFavorite', isFavorite);
    return this.http.put<ImageMetadata>(`${this.baseUrl}/SetFavorite/${id}`, null, { params });
  }

  suggestTags(query: string): Observable<string[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<string[]>(`${this.baseUrl}/SuggestTags`, { params });
  }

  getThumbnailUrl(id: string): string {
    return `${this.baseUrl}/GetThumbnail/${id}`;
  }

  getOriginalUrl(id: string): string {
    return `${this.baseUrl}/GetOriginal/${id}`;
  }
}
