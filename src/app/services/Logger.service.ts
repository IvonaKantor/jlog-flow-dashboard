import { Injectable } from '@angular/core';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  level: LogLevel = LogLevel.DEBUG;

  debug(message: string, ...optionalParams: any[]) {
    this.log(LogLevel.DEBUG, message, optionalParams);
  }

  error(message: string, ...optionalParams: any[]) {
    this.log(LogLevel.ERROR, message, optionalParams);
  }

  private log(level: LogLevel, message: string, params: any[]) {
    if (level >= this.level) {
      const logMessage = `[${new Date().toISOString()}] [${LogLevel[level]}] ${message}`;
      if (params.length) {
        console.log(logMessage, ...params);
      }
    }
  }
}
