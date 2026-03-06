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
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  threadName: string;
  threadId: number;
  mdc: Record<string, any>;
  ndc: string;
  hostName: string;
  processName: string;
  processId: number;
  serviceName: string;
  serviceId: string;
  exception?: Exception;
}
