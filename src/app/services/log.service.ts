import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, map, catchError, throwError} from 'rxjs';
import {Log, LogResponse, LogFilters, LogSearchRequest} from '../models/log.model';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private readonly apiUrl = 'http://localhost:8080/v1/log';

  constructor(private http: HttpClient) {}

  private buildParams(
    filters?: LogFilters,
    pageSize?: number,
    pageIndex?: number
  ): HttpParams {
    let params = new HttpParams();

    if (filters) {
      if (filters.level && filters.level.length > 0) {
        if (filters.level.length > 1) {
          filters.level.forEach(level => {
            params = params.append('level', level);
          });
        } else {
          params = params.set('level', filters.level[0]);
        }
      }

      if (filters.serviceName) {
        params = params.set('serviceName', filters.serviceName);
      }

      if (filters.hostName) {
        params = params.set('hostName', filters.hostName);
      }

      if (filters.startDate) {
        const from = new Date(filters.startDate);
        if (!isNaN(from.getTime())) {
          params = params.set('fromDate', from.toISOString());
        }
      }

      if (filters.endDate) {
        let to = new Date(filters.endDate);
        if (!isNaN(to.getTime())) {
          to = new Date(to.getTime() + 999);
          params = params.set('toDate', to.toISOString());
        }
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

  getLogsResponse(pageSize?: number, pageIndex?: number): Observable<LogResponse> {
    const params = this.buildParams(undefined, pageSize, pageIndex);
    return this.http.get<LogResponse>(this.apiUrl, {params});
  }

  getFilteredLogsResponse(filters: LogFilters, pageSize?: number, pageIndex?: number): Observable<LogResponse> {
    const params = this.buildParams(filters, pageSize, pageIndex);

    return this.http.get<LogResponse>(this.apiUrl, {params}).pipe(
      catchError(err => {
        if (filters.level && filters.level.length > 1) {
          const fallbackParams = this.buildParams(filters, pageSize, pageIndex);
          return this.http.get<LogResponse>(this.apiUrl, {params: fallbackParams});
        }
        return throwError(() => err);
      })
    );
  }

  private buildSearchBody(
    filters: LogFilters,
    pageSize: number,
    pageIndex: number
  ): LogSearchRequest {
    if (pageSize < 1) {
      throw new Error(`Invalid pageSize: ${pageSize}. Must be at least 1.`);
    }
    if (pageIndex < 0) {
      throw new Error(`Invalid pageIndex: ${pageIndex}. Must be 0 or greater.`);
    }

    const body: LogSearchRequest = {pageSize, pageIndex};

    if (filters.level && filters.level.length > 0) {
      body.level = filters.level;
    }
    if (filters.serviceName) {
      body.serviceName = filters.serviceName;
    }
    if (filters.hostName) {
      body.hostName = filters.hostName;
    }
    if (filters.startDate) {
      const from = new Date(filters.startDate);
      if (!isNaN(from.getTime())) {
        body.fromDate = from.toISOString();
      }
    }
    if (filters.endDate) {
      const to = new Date(new Date(filters.endDate).getTime() + 999);
      if (!isNaN(to.getTime())) {
        body.toDate = to.toISOString();
      }
    }
    if (filters.search) {
      body.search = filters.search;
    }

    return body;
  }

  searchLogs(filters: LogFilters, pageSize: number, pageIndex: number): Observable<Log[]> {
    const body = this.buildSearchBody(filters, pageSize, pageIndex);
    return this.http.post<LogResponse>(`${this.apiUrl}/search`, body).pipe(
      map(response => response.items)
    );
  }

  searchLogsResponse(filters: LogFilters, pageSize: number, pageIndex: number): Observable<LogResponse> {
    const body = this.buildSearchBody(filters, pageSize, pageIndex);
    return this.http.post<LogResponse>(`${this.apiUrl}/search`, body);
  }

  getServices(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/services`);
  }

  getHosts(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/hosts`);
  }
}
