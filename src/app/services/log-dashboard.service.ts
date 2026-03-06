import { Injectable } from '@angular/core';

export interface DashboardStats {
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  debugCount: number;
  logsPerSecond: number;
}

export interface TimeSeriesPoint {
  timestamp: Date;
  count: number;
  level?: string;
}

export interface LoggerStat {
  loggerName: string;
  count: number;
  lastMessage: string;
  lastTimestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LogDashboardService {

}
