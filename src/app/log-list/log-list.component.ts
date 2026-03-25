import {Component, OnInit} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {forkJoin} from 'rxjs';
import {LogService} from '../services/log.service';
import {Log, LogFilters} from '../models/log.model';
import {LoggerService} from '../services/Logger.service';
import {StatisticsComponent} from '../components/statistics/statistics.component';

@Component({
  selector: 'app-log-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage, StatisticsComponent],
  templateUrl: './log-list.component.html',
  styleUrls: ['./log-list.component.css']
})
export class LogListComponent implements OnInit {
  filteredLogs: Log[] = [];
  services: string[] = [];
  hosts: string[] = [];

  readonly pageSizeOptions = [25, 50, 100, 200];
  pageSize = 100;
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

    const hasActiveFilters = (this.filters.level?.length ?? 0) > 0 ||
      !!this.filters.serviceName ||
      !!this.filters.hostName ||
      !!this.filters.startDate ||
      !!this.filters.endDate ||
      !!this.filters.search;

    if (hasActiveFilters) {
      this.loadFilteredLogs();
    } else {
      this.loadLatestLogs();
    }
  }

  private loadLatestLogs() {
    const pageSize = this.pageSize;

    this.logService.getLogsResponse(pageSize, 0).subscribe({
      next: (response) => {
        const lastPageIndex = Math.max(0, response.pageCount - 1);
        if (lastPageIndex === 0) {
          this.applyLoadedLogs(response.items);
          return;
        }

        const oldestFirst = this.isOldestFirst(response.items);
        const targetPageIndex = oldestFirst ? lastPageIndex : 0;

        if (targetPageIndex === 0) {
          this.applyLoadedLogs(response.items);
          return;
        }

        this.logService.getLogsResponse(pageSize, targetPageIndex).subscribe({
          next: (lastPageResponse) => this.applyLoadedLogs(lastPageResponse.items),
          error: (err) => this.handleLoadError(err)
        });
      },
      error: (err) => this.handleLoadError(err)
    });
  }

  private loadFilteredLogs() {
    const pageSize = this.pageSize;

    const multiLevelFilter = (this.filters.level?.length ?? 0) > 1;
    const allowedLevels = new Set(this.filters.level ?? []);

    const requestFilters: LogFilters = {
      ...this.filters,
      level: multiLevelFilter ? [] : this.filters.level
    };

    const hasDateFilter = !!this.filters.startDate || !!this.filters.endDate;
    const maxPagesToScan = hasDateFilter ? Number.MAX_SAFE_INTEGER : 5;

    this.logService.getFilteredLogsResponse(requestFilters, pageSize, 0).subscribe({
      next: (response) => {
        const lastPageIndex = Math.max(0, response.pageCount - 1);
        const oldestFirst = this.isOldestFirst(response.items);

        const pageIndices: number[] = [];
        if (hasDateFilter) {
          for (let i = 0; i <= lastPageIndex; i++) {
            pageIndices.push(i);
          }
        } else {
          if (oldestFirst) {
            const startPageIndex = Math.max(0, lastPageIndex - (maxPagesToScan - 1));
            for (let i = lastPageIndex; i >= startPageIndex; i--) {
              pageIndices.push(i);
            }
          } else {
            const endPageIndex = Math.min(lastPageIndex, maxPagesToScan - 1);
            for (let i = 0; i <= endPageIndex; i++) {
              pageIndices.push(i);
            }
          }
        }

        const requests = pageIndices.map(pageIndex =>
          this.logService.getFilteredLogsResponse(requestFilters, pageSize, pageIndex)
        );

        forkJoin(requests).subscribe({
          next: (responses) => {
            const mergedItems = responses.flatMap(r => r.items ?? []);
            let filteredItems = multiLevelFilter
              ? mergedItems.filter(log => allowedLevels.has(log.level))
              : mergedItems;

            filteredItems = this.applyClientSideFilters(filteredItems, requestFilters);

            this.applyLoadedLogs(filteredItems);
          },
          error: (err) => this.handleLoadError(err)
        });
      },
      error: (err) => this.handleLoadError(err)
    });
  }

  private applyLoadedLogs(data: Log[]) {
    const sorted = this.sortLogsByTimestampDesc(data);

    this.filteredLogs = sorted;
    this.updatePagination();
    this.loading = false;
    this.logger.debug('Logs loaded', {count: data.length});
  }

  private handleLoadError(err: any) {
    this.error = 'Failed to load logs: ' + err?.message;
    this.loading = false;
    this.logger.error('Failed to load logs', err);
  }

  private sortLogsByTimestampDesc(logs: Log[]): Log[] {
    return [...logs].sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return tb - ta;
    });
  }

  private isOldestFirst(logs: Log[]): boolean {
    if (!logs || logs.length < 2) {
      return true;
    }

    const first = new Date(logs[0].timestamp).getTime();
    const last = new Date(logs[logs.length - 1].timestamp).getTime();

    if (!Number.isFinite(first) || !Number.isFinite(last)) {
      return true;
    }

    return first <= last;
  }

  private applyClientSideFilters(logs: Log[], filters: LogFilters): Log[] {
    return logs.filter(log => {
      if (filters.hostName && log.hostName?.trim() !== filters.hostName.trim()) {
        return false;
      }

      if (filters.serviceName && log.serviceName?.trim() !== filters.serviceName.trim()) {
        return false;
      }

      if (filters.startDate) {
        const from = new Date(filters.startDate).getTime();
        const cur = new Date(log.timestamp).getTime();
        if (Number.isFinite(from) && cur < from) {
          return false;
        }
      }

      if (filters.endDate) {
        const to = new Date(filters.endDate).getTime();
        const cur = new Date(log.timestamp).getTime();
        if (Number.isFinite(to) && cur > to) {
          return false;
        }
      }

      if (filters.search) {
        const text = filters.search.trim().toLowerCase();
        const haystack = (log.message + ' ' + log.hostName + ' ' + log.serviceName + ' ' + (log.exception?.message ?? '')).toLowerCase();
        if (!haystack.includes(text)) {
          return false;
        }
      }

      return true;
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
