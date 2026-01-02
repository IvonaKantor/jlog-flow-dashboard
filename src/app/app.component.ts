import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule
  ],
  template: `./app.component.html`,
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'Jlog Flow Dashboard';
}
