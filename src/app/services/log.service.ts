import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Log} from '../models/log.model';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = 'http://localhost:8080/api/logs';

  constructor(private http: HttpClient) {
  }

  getLogs(page?: number, size?: number): Observable<Log[]> {
    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());

    return this.http.get<Log[]>(`${this.apiUrl}/logs`, { params });
  }


  getLogById(id: string): Observable<Log> {
    return this.http.get<Log>(`${this.apiUrl}/logs/${id}`);
  }

  getServices(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/logs/services`);
  }

  getHosts(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/logs/hosts`);
  }
}
