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
      background: #f5f5f5;
    }
  `]
})
export class AppComponent {
  title = 'jlog-flow-dashboard';
}
