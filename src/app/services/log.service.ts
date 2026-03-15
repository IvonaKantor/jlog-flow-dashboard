import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, map, catchError, throwError} from 'rxjs';
import {Log, LogResponse, LogFilters} from '../models/log.model';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private readonly apiUrl = 'http://localhost:8080/v1/log';

  constructor(private http: HttpClient) {
  }

  getLogs(): Observable<Log[]> {
    return this.http.get<LogResponse>(this.apiUrl).pipe(
      map(response => response.items)
    );
  }

  private buildFilterParams(filters: LogFilters, useCommaSeparatedLevels = true): HttpParams {
    let params = new HttpParams();

    if (filters.level && filters.level.length > 0) {
      if (useCommaSeparatedLevels) {
        params = params.set('level', filters.level.join(','));
      } else {
        filters.level.forEach(level => {
          params = params.append('level', level);
        });
      }
    }

    if (filters.serviceName) {
      params = params.set('serviceName', filters.serviceName);
    }

    if (filters.hostName) {
      params = params.set('hostName', filters.hostName);
    }

    if (filters.startDate) {
      params = params.set('fromDate', filters.startDate);
    }

    if (filters.endDate) {
      params = params.set('toDate', filters.endDate);
    }

    if (filters.search) {
      params = params.set('search', filters.search);
    }

    return params;
  }

  getFilteredLogs(filters: LogFilters): Observable<Log[]> {
    const params = this.buildFilterParams(filters, true);

    return this.http.get<LogResponse>(this.apiUrl, {params}).pipe(
      map(response => response.items),
      catchError(err => {
        
        if (filters.level && filters.level.length > 1) {
          const fallbackParams = this.buildFilterParams(filters, false);
          return this.http.get<LogResponse>(this.apiUrl, {params: fallbackParams}).pipe(
            map(response => response.items)
          );
        }
        return throwError(() => err);
      })
    );
  }

  getServices(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/services`);
  }

  getHosts(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/hosts`);
  }
}
