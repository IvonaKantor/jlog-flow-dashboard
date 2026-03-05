import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTableModule} from '@angular/material/table';
import {NgxEchartsModule} from 'ngx-echarts';
import type {EChartsOption} from 'echarts';
import {Subject, takeUntil, forkJoin, interval} from 'rxjs';
import {switchMap, startWith} from 'rxjs/operators';

import {
  LogDashboardService,
  DashboardStats,
  TimeSeriesPoint,
  LoggerStat
} from '../../core/services/log-dashboard.service';
import {LogApiService, LogEntry} from '../../core/services/log-api.service';
import {MatSlideToggle} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-log-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTableModule,
    NgxEchartsModule,
    MatSlideToggle
  ],
  templateUrl: './log-dashboard.component.html',
  styleUrls: ['./log-dashboard.component.scss']
})
export class LogDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  timeRanges = [
    {label: 'Last 5 minutes', value: 5 * 60 * 1000},
    {label: 'Last 15 minutes', value: 15 * 60 * 1000},
    {label: 'Last 30 minutes', value: 30 * 60 * 1000},
    {label: 'Last 1 hour', value: 60 * 60 * 1000},
    {label: 'Last 3 hours', value: 3 * 60 * 60 * 1000},
    {label: 'Last 6 hours', value: 6 * 60 * 60 * 1000},
    {label: 'Last 12 hours', value: 12 * 60 * 60 * 1000},
    {label: 'Last 24 hours', value: 24 * 60 * 60 * 1000}
  ];

  selectedTimeRange = 15 * 60 * 1000;
  autoRefresh = true;
  refreshInterval = 30;

  stats: DashboardStats | null = null;
  timeSeriesData: TimeSeriesPoint[] = [];
  topLoggers: LoggerStat[] = [];
  recentLogs: LogEntry[] = [];

  loading = false;
  error: string | null = null;

  timeSeriesChartOption: EChartsOption = {};
  levelDistributionOption: EChartsOption = {};

  displayedLoggerColumns: string[] = ['loggerName', 'count', 'lastMessage', 'lastTimestamp'];

  constructor(
    private dashboardService: LogDashboardService,
    private logApi: LogApiService
  ) {
  }

  ngOnInit(): void {
    this.loadDashboardData();

    interval(this.refreshInterval * 1000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          if (this.autoRefresh) {
            return this.loadDashboardDataObservable();
          }
          return [];
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.loadDashboardDataObservable().subscribe({
      next: () => this.loading = false,
      error: (err) => {
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
        console.error('Dashboard error:', err);
      }
    });
  }

  private loadDashboardDataObservable() {
    const timeRange = this.getTimeRange();

    return forkJoin({
      stats: this.dashboardService.getDashboardStats(timeRange),
      timeSeries: this.dashboardService.getTimeSeriesData(timeRange, 'minute'),
      levelDist: this.dashboardService.getLevelDistribution(timeRange),
      topLoggers: this.dashboardService.getTopLoggers(timeRange, 10),
      recentLogs: this.logApi.getLogs({
        pageIndex: 0,
        pageSize: 15,
        startDate: timeRange.start,
        endDate: timeRange.end
      })
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.timeSeriesData = data.timeSeries;
        this.topLoggers = data.topLoggers;
        this.recentLogs = data.recentLogs.logs;

        this.updateCharts(data.timeSeries, data.levelDist);
      }
    });
  }

  private getTimeRange() {
    const end = new Date();
    const start = new Date(end.getTime() - this.selectedTimeRange);
    return {start, end};
  }

  private updateCharts(timeSeries: TimeSeriesPoint[], levelDist: any): void {
    this.updateTimeSeriesChart(timeSeries);
    this.updateLevelDistributionChart(levelDist);
  }

  private updateTimeSeriesChart(data: TimeSeriesPoint[]): void {
    this.timeSeriesChartOption = {
      title: {
        text: 'Logs Over Time',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(point => this.formatTime(point.timestamp)),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value',
        name: 'Log Count'
      },
      series: [
        {
          name: 'Logs',
          type: 'bar',
          data: data.map(point => point.count),
          itemStyle: {
            color: function (params: any) {
              const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];
              return colors[params.dataIndex % colors.length];
            }
          }
        }
      ]
    };
  }

  private updateLevelDistributionChart(data: any): void {
    this.levelDistributionOption = {
      title: {
        text: 'Logs by Level',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']
      },
      series: [
        {
          name: 'Log Level',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '20',
              fontWeight: 'bold'
            }
          },
          data: [
            {value: data?.errorCount || 0, name: 'ERROR', itemStyle: {color: '#f56c6c'}},
            {value: data?.warnCount || 0, name: 'WARN', itemStyle: {color: '#e6a23c'}},
            {value: data?.infoCount || 0, name: 'INFO', itemStyle: {color: '#409eff'}},
            {value: data?.debugCount || 0, name: 'DEBUG', itemStyle: {color: '#67c23a'}},
            {value: data?.traceCount || 0, name: 'TRACE', itemStyle: {color: '#909399'}}
          ]
        }
      ]
    };
  }


  private formatTime(timestamp: Date): string {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  }


  getLevelIcon(level: string): string {
    switch (level?.toUpperCase()) {
      case 'ERROR':
      case 'FATAL':
        return 'error';
      case 'WARN':
        return 'warning';
      case 'INFO':
        return 'info';
      case 'DEBUG':
        return 'bug_report';
      default:
        return 'article';
    }
  }


  getLevelColor(level: string): string {
    switch (level?.toUpperCase()) {
      case 'ERROR':
      case 'FATAL':
        return '#f44336';
      case 'WARN':
        return '#ff9800';
      case 'INFO':
        return '#2196f3';
      case 'DEBUG':
        return '#4caf50';
      case 'TRACE':
        return '#9e9e9e';
      default:
        return '#757575';
    }
  }


  onTimeRangeChange(): void {
    this.loadDashboardData();
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
  }

  refresh(): void {
    this.loadDashboardData();
  }
}
