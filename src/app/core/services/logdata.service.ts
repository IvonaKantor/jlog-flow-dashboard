import { Injectable, signal, computed } from '@angular/core';
import { LogEntry, DashboardStats } from '../../shared/models/log.model';

@Injectable({ providedIn: 'root' })
export class LogDataService {
  private logsSignal = signal<LogEntry[]>([
    { id: 1, timestamp: new Date(), level: 'ERROR', message: 'Database connection failed' },
    { id: 2, timestamp: new Date(), level: 'INFO', message: 'API request processed' },
    { id: 3, timestamp: new Date(), level: 'WARN', message: 'High memory usage detected' }
  ]);

  readonly logs = this.logsSignal.asReadonly();
}
