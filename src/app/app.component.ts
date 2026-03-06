import {Component, OnInit} from '@angular/core';
import {LogService} from './services/log.service';
import {Log} from './models/log.model';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    DatePipe
  ],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  logs: Log[] = [];
  loading = true;
  error: string | null = null;

  constructor(private logService: LogService) {
  }

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    this.logService.getLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.loading = false;
        console.log('get logs:', data);
      },
      error: (err) => {
        this.error = 'cannt connect to the backend: ' + err.message;
        this.loading = false;
        console.error('error:', err);
      }
    });
  }
}
