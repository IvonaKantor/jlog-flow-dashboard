import { Component } from '@angular/core';
import { LogListComponent } from './log-list/log-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LogListComponent],
  template: `
    <main>
      <app-log-list></app-log-list>
    </main>
  `,
  styles: [`
    main {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 32px 16px 80px;
      background: transparent;
    }
  `]
})
export class AppComponent {}
