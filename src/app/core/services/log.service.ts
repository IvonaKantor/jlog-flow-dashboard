import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Log} from '../../models/log.model';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = '/api/logs';

  constructor(private http: HttpClient) {
  }

  getLogs(filters?: any): Observable<Log[]> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<Log[]>(this.apiUrl, {params});
  }

  getLogById(id: number): Observable<Log> {
    return this.http.get<Log>(`${this.apiUrl}/${id}`);
  }

  getServices(): Observable<string[]> {
    return this.http.get<string[]>(`/api/services`);
  }
}
