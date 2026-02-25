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
