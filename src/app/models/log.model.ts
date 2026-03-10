export interface ExceptionFrame {
  class: string;
  method: string;
  line: number;
}

export interface Exception {
  refId: number;
  exceptionType: string;
  message: string;
  frames: ExceptionFrame[];
}

export interface Log {
  timestamp: string;
  sequence: number;
  loggerClassName: string;
  loggerName: string;
  level: string;
  message: string;
  threadName: string;
  threadId: number;
  ndc: string;
  mdc: Record<string, any>;
  hostName: string;
  processName: string;
  processId: number;
  exception?: Exception;
  serviceName: string;
  serviceId: string;
}

export interface LogResponse {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  items: Log[];
}

export interface LogFilters {
  level?: string[];
  serviceName?: string;
  hostName?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}
