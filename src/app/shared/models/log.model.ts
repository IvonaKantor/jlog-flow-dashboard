export interface LogEntry {
  id: number;
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' ;
  message: string;
}

export interface DashboardStats {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
}
