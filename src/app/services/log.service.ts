import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, map} from 'rxjs';
import {Log, LogResponse, LogFilters} from '../models/log.model';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = 'http://localhost:8080/v1/log';

  constructor(private http: HttpClient) {
  }

  getLogs(): Observable<Log[]> {
    return this.http.get<LogResponse>(this.apiUrl).pipe(
      map(response => response.items)
    );
  }

  getFilteredLogs(filters: LogFilters): Observable<Log[]> {
    let params = new HttpParams();

    if (filters.level && filters.level.length > 0) {
      filters.level.forEach(level => {
        params = params.append('level', level);
      });
    }

    return this.http.get<LogResponse>(this.apiUrl, {params}).pipe(
      map(response => response.items)
    );
  }
}
