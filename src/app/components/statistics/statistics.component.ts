import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Log } from '../../models/log.model';

interface ChartData {
  name: string;
  value: number;
  extra?: {
    color: string;
    percentage?: number;
  }
}

interface PieLabelPosition {
  level: string;
  value: string;
  left: number;
  top: number;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnChanges {
  @Input() filteredLogs: Log[] = [];

  readonly fixedBarHeight = 40;
  readonly barGap = 8;
  readonly barChartVerticalPadding = 16;
  readonly pieChartView: [number, number] = [300, 260];
  readonly pieChartMargins: [number, number, number, number] = [10, 10, 10, 10];

  barChartData: ChartData[] = [];
  pieChartData: ChartData[] = [];
  pieLabelPositions: PieLabelPosition[] = [];

  levelColors: Record<string, string> = {
    'ERROR': '#f44336',
    'WARN': '#ff9800',
    'INFO': '#2196f3',
    'DEBUG': '#58a824'
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filteredLogs']) {
      this.calculateStatistics();
    }
  }

  private calculateStatistics(): void {
    const levelCounts = this.countLogsByLevel(this.filteredLogs);
    this.barChartData = this.sortByLevel(levelCounts);
    this.pieChartData = this.calculatePercentages(levelCounts);
    this.pieLabelPositions = this.calculatePieLabelPositions(this.pieChartData);
  }

  private countLogsByLevel(logs: Log[]): Record<string, number> {
    const counts: Record<string, number> = {
      'ERROR': 0,
      'WARN': 0,
      'INFO': 0,
      'DEBUG': 0
    };

    logs.forEach(log => {
      if (counts.hasOwnProperty(log.level)) {
        counts[log.level]++;
      }
    });

    return counts;
  }

  private sortByLevel(counts: Record<string, number>): ChartData[] {
    const order = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
    return order
      .filter(level => counts[level] > 0)
      .map(level => ({
        name: level,
        value: counts[level],
        extra: {
          color: this.levelColors[level]
        }
      }));
  }

  private calculatePercentages(counts: Record<string, number>): ChartData[] {
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    if (total === 0) {
      return [];
    }

    const order = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
    return order
      .filter(level => counts[level] > 0)
      .map(level => ({
        name: level,
        value: counts[level],
        extra: {
          color: this.levelColors[level],
          percentage: Math.round((counts[level] / total) * 100)
        }
      }));
  }

  get barChartColors(): any {
    return {
      domain: this.barChartData.map(d => this.levelColors[d.name])
    };
  }

  get pieChartColors(): any {
    return {
      domain: this.pieChartData.map(d => this.levelColors[d.name])
    };
  }

  barDataLabelFormatting = (value: number): string => `${value}`;

  private calculatePieLabelPositions(data: ChartData[]): PieLabelPosition[] {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
      return [];
    }

    const [width, height] = this.pieChartView;
    const [marginTop, marginRight, marginBottom, marginLeft] = this.pieChartMargins;
    const drawableWidth = width - marginLeft - marginRight;
    const drawableHeight = height - marginTop - marginBottom;
    const centerX = marginLeft + (drawableWidth / 2);
    const centerY = marginTop + (drawableHeight / 2);
    const radius = Math.min(drawableWidth, drawableHeight) / 2;
    const labelRadius = radius * 0.68;

    let startAngle = 0;

    return data.map(item => {
      const sweepAngle = (item.value / total) * (Math.PI * 2);
      const middleAngle = startAngle + (sweepAngle / 2) - (Math.PI / 2);

      startAngle += sweepAngle;

      return {
        level: item.name,
        value: `${item.extra?.percentage ?? 0}%`,
        left: ((centerX + (Math.cos(middleAngle) * labelRadius)) / width) * 100,
        top: ((centerY + (Math.sin(middleAngle) * labelRadius)) / height) * 100
      };
    });
  }

  get barChartCanvasHeight(): number {
    const barCount = this.barChartData.length;

    if (barCount === 0) {
      return 0;
    }

    return (barCount * this.fixedBarHeight) +
      ((barCount - 1) * this.barGap) +
      this.barChartVerticalPadding;
  }
}

