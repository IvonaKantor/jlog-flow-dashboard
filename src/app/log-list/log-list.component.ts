import {Component, OnInit} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {LogService} from '../services/log.service';
import {Log, LogFilters} from '../models/log.model';
import {LoggerService} from '../services/Logger.service';

@Component({
  selector: 'app-log-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage],
  templateUrl: './log-list.component.html',
  styleUrls: ['./log-list.component.css']
})
export class LogListComponent implements OnInit {
  logs: Log[] = [];
  filteredLogs: Log[] = [];
  services: string[] = [];
  hosts: string[] = [];
 
  readonly pageSizeOptions = [10, 25, 50, 100];
  pageSize = 25;
  pageIndex = 0;

  loading = true;
  error: string | null = null;

  filters: LogFilters = {
    level: [],
    serviceName: '',
    hostName: '',
    startDate: '',
    endDate: '',
    search: ''
  };

  readonly availableLevels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];

  constructor(
    private readonly logService: LogService,
    private readonly logger: LoggerService
  ) {}

  ngOnInit() {
    this.loadLogs();
    this.loadFilters();
  }

  loadLogs() {
    this.loading = true;
    this.error = null;

    const hasActiveFilters = this.filters.level ||
      this.filters.serviceName ||
      this.filters.hostName ||
      this.filters.startDate ||
      this.filters.endDate ||
      this.filters.search;

    const logsObservable = hasActiveFilters
      ? this.logService.getFilteredLogs(this.filters)
      : this.logService.getLogs();

    logsObservable.subscribe({
      next: (data) => {
        this.logs = data;
        this.filteredLogs = data;
        this.updatePagination();
        this.loading = false;
        this.logger.debug('Logs loaded', {count: data.length});
      },
      error: (err) => {
        this.error = 'Failed to load logs: ' + err.message;
        this.loading = false;
        this.logger.error('Failed to load logs', err);
      }
    });
  }

  private updatePagination() { 
    const total = this.totalPages;
    if (this.pageIndex >= total) {
      this.pageIndex = Math.max(0, total - 1);
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredLogs.length / this.pageSize));
  }

  get pagedLogs(): Log[] {
    const start = this.pageIndex * this.pageSize;
    return this.filteredLogs.slice(start, start + this.pageSize);
  }

  setPage(index: number) {
    this.pageIndex = Math.max(0, Math.min(index, this.totalPages - 1));
  }

  onPageSizeChange(newSize: number | string) {
    const parsed = typeof newSize === 'string' ? parseInt(newSize, 10) : newSize;
    this.pageSize = Number.isFinite(parsed) && parsed > 0 ? parsed : this.pageSize;
    this.setPage(0);
  }

  loadFilters() {
    this.logService.getServices().subscribe({
      next: (data) => (this.services = data),
      error: (err) => this.logger.error('Failed to load service names', err)
    });

    this.logService.getHosts().subscribe({
      next: (data) => (this.hosts = data),
      error: (err) => this.logger.error('Failed to load host names', err)
    });
  }

  toggleLevel(level: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (!this.filters.level) {
      this.filters.level = [];
    }

    if (checked) {
      this.filters.level.push(level);
    } else {
      this.filters.level = this.filters.level.filter(l => l !== level);
    }
  }

  applyFilters() {
    this.loadLogs();
  }

  resetFilters() {
    this.filters = {
      level: [],
      serviceName: '',
      hostName: '',
      startDate: '',
      endDate: '',
      search: ''
    };
    this.loadLogs();
  }

  getRowBackground(level: string): string {
    switch (level) {
      case 'ERROR':
        return '#ffebee';
      case 'WARN':
        return '#fff3e0';
      default:
        return 'white';
    }
  }

  getLevelColor(level: string): string {
    switch (level) {
      case 'ERROR':
        return '#f44336';
      case 'WARN':
        return '#ff9800';
      case 'INFO':
        return '#2196f3';
      case 'DEBUG':
        return '#58a824';
      default:
        return '#9e9e9e';
    }
  }

  formatDate(timestamp: string): string {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getProcessName(processPath: string): string {
    if (!processPath) return '-';
    const parts = processPath.split('\\');
    return parts[parts.length - 1] || processPath;
  }

  protected readonly Object = Object;
}
