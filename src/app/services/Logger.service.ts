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

  info(message: string, ...optionalParams: any[]) {
    this.log(LogLevel.INFO, message, optionalParams);
  }

  warn(message: string, ...optionalParams: any[]) {
    this.log(LogLevel.WARN, message, optionalParams);
  }

  error(message: string, ...optionalParams: any[]) {
    this.log(LogLevel.ERROR, message, optionalParams);
  }

  private log(level: LogLevel, message: string, params: any[]) {
    if (level < this.level) {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${LogLevel[level]}]`;
    const output = [prefix, message];

    if (params?.length) {
      output.push(...params);
    }

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(...output);
        break;
      case LogLevel.INFO:
        console.info(...output);
        break;
      case LogLevel.WARN:
        console.warn(...output);
        break;
      case LogLevel.ERROR:
        console.error(...output);
        break;
      default:
        console.log(...output);
    }
  }
}
