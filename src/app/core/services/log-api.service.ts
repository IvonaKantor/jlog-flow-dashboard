import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  message: string;
  source?: string;
  details?: any;
}

export interface LogFilter {
  level?: string;
  startDate?: Date;
  endDate?: Date;
  source?: string;
  searchText?: string;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LogApiService {
  private apiUrl = `${environment.apiUrl}/logs`;

  constructor(private http: HttpClient) {}

  getLogs(filter: LogFilter): Observable<{ logs: LogEntry[], total: number }> {
    let params = new HttpParams();
    if (filter.level) params = params.set('level', filter.level);
    if (filter.startDate) params = params.set('startDate', filter.startDate.toISOString());
    if (filter.endDate) params = params.set('endDate', filter.endDate.toISOString());

    return this.http.get<{ logs: LogEntry[], total: number }>(this.apiUrl, { params });
  }
}
