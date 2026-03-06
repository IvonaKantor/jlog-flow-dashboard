import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Log, LogResponse } from '../models/log.model';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = 'http://localhost:8080/v1/log';

  constructor(private http: HttpClient) {}

  getLogs(): Observable<Log[]> {
    return this.http.get<LogResponse>(this.apiUrl).pipe(
      map(response => response.items)
    );
  }
}
