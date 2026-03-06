import { Component, OnInit, OnDestroy } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { LogService } from '../../services/log.service';
import { Log } from '../../models/log.model';
import {MatError, MatFormField, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatTable} from '@angular/material/table';
import {MatIcon} from '@angular/material/icon';
import {MatPaginator} from '@angular/material/paginator';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-log-list',
  templateUrl: './log-list.component.html',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatSelect,
    MatOption,
    MatLabel,
    MatError,
    MatProgressSpinner,
    MatDatepicker,
    MatDatepickerToggle,
    MatDatepickerInput,
    MatTable,
    MatIcon,
    MatPaginator,
    NgClass
  ],
  styleUrls: ['./log-list.component.scss']
})
export class LogListComponent implements OnInit, OnDestroy {
  logs: Log[] = [];
  loading = false;
  error: string | null = null;

  filterForm: FormGroup;

  services: string[] = [];

  logLevels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];

  private destroy$ = new Subject<void>();

  constructor(
    private logService: LogService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      serviceName: [''],
      level: [''],
      searchText: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadLogs();

    this.filterForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadLogs();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadServices(): void {
    this.logService.getServices().subscribe({
      next: (services) => {
        this.services = services;
      },
      error: (err) => {
        console.error('Service loading error', err);
      }
    });
  }

  loadLogs(): void {
    this.loading = true;
    this.error = null;

    const filters = this.prepareFilters();

    this.logService.getLogs(filters).subscribe({
      next: (data) => {
        this.logs = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Unable to load logs';
        this.loading = false;
        console.error('Log retrieval error', err);
      }
    });
  }

  prepareFilters(): any {
    const formValue = this.filterForm.value;
    const filters: any = {};

    if (formValue.serviceName) {
      filters.service = formValue.serviceName;
    }

    if (formValue.level) {
      filters.level = formValue.level;
    }

    if (formValue.searchText) {
      filters.search = formValue.searchText;
    }

    if (formValue.fromDate) {
      filters.from = new Date(formValue.fromDate).toISOString();
    }

    if (formValue.toDate) {
      filters.to = new Date(formValue.toDate).toISOString();
    }

    return filters;
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  hasException(log: Log): boolean {
    return !!log.exception;
  }
}
