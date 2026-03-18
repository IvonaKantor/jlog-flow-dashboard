import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, map, catchError, throwError} from 'rxjs';
import {Log, LogResponse, LogFilters} from '../models/log.model';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private readonly apiUrl = 'http://localhost:8080/v1/log';

  constructor(private http: HttpClient) {}

  private buildParams(
    filters?: LogFilters,
    pageSize?: number,
    pageIndex?: number,
    useCommaSeparatedLevels = true
  ): HttpParams {
    let params = new HttpParams();

    if (filters) {
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
    }

    if (pageSize != null) {
      params = params.set('pageSize', pageSize.toString());
    }

    if (pageIndex != null) {
      params = params.set('pageIndex', pageIndex.toString());
    }

    return params;
  }

  getLogs(pageSize?: number, pageIndex?: number): Observable<Log[]> {
    const params = this.buildParams(undefined, pageSize, pageIndex);
    return this.http.get<LogResponse>(this.apiUrl, {params}).pipe(
      map(response => response.items)
    );
  }

  getLogsResponse(pageSize?: number, pageIndex?: number): Observable<LogResponse> {
    const params = this.buildParams(undefined, pageSize, pageIndex);
    return this.http.get<LogResponse>(this.apiUrl, {params});
  }

  getFilteredLogs(filters: LogFilters, pageSize?: number, pageIndex?: number): Observable<Log[]> {
    const params = this.buildParams(filters, pageSize, pageIndex, true);

    return this.http.get<LogResponse>(this.apiUrl, {params}).pipe(
      map(response => response.items),
      catchError(err => {
        if (filters.level && filters.level.length > 1) {
          const fallbackParams = this.buildParams(filters, pageSize, pageIndex, false);
          return this.http.get<LogResponse>(this.apiUrl, {params: fallbackParams}).pipe(
            map(response => response.items)
          );
        }
        return throwError(() => err);
      })
    );
  }

  getFilteredLogsResponse(filters: LogFilters, pageSize?: number, pageIndex?: number): Observable<LogResponse> {
    const params = this.buildParams(filters, pageSize, pageIndex, true);

    return this.http.get<LogResponse>(this.apiUrl, {params}).pipe(
      catchError(err => {
        if (filters.level && filters.level.length > 1) {
          const fallbackParams = this.buildParams(filters, pageSize, pageIndex, false);
          return this.http.get<LogResponse>(this.apiUrl, {params: fallbackParams});
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
