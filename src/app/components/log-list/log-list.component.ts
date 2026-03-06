import { Component, OnInit } from '@angular/core';
import { LogService } from '../../services/log.service';
import { Log } from '../../models/log.model';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-log-list',
  template: `
    <div class="log-container">
      <table class="log-table">
        <thead>
        <tr>
          <th>Timestamp</th>
          <th>Level</th>
          <th>Service</th>
          <th>Message</th>
          <th>Host</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let log of logs"
            [class.error]="log.level === 'ERROR'"
            [class.warn]="log.level === 'WARN'"
            (click)="selectLog(log)">
          <td>{{ log.timestamp }}</td>
          <td><span class="badge" [ngClass]="log.level">{{ log.level }}</span></td>
          <td>{{ log.serviceName }}</td>
          <td>{{ log.message }}</td>
          <td>{{ log.hostName }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  `,
  imports: [
    NgClass
  ],
  styles: [`
    .log-table {
      width: 100%;
      border-collapse: collapse;
    }

    .log-table tr {
      cursor: pointer;
    }

    .log-table tr:hover {
      background-color: #f5f5f5;
    }

    .error {
      background-color: #ffebee;
    }

    .warn {
      background-color: #fff3e0;
    }

    .badge {
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: bold;
    }

    .badge.INFO {
      background-color: #2196f3;
      color: white;
    }

    .badge.WARN {
      background-color: #ff9800;
      color: white;
    }

    .badge.ERROR {
      background-color: #f44336;
      color: white;
    }
  `]
})
export class LogListComponent implements OnInit {
  logs: Log[] = [];
  selectedLog: Log | null = null;
  currentPage = 0;
  totalLogs = 0;

  constructor(private logService: LogService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.logService.getLogs(this.currentPage, 50).subscribe(logs => {
      this.logs = logs;
    });
  }

  selectLog(log: Log) {
    this.selectedLog = log;
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.loadLogs();
  }
}
