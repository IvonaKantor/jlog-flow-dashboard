import { Component, OnInit, inject } from '@angular/core';
import { LogListComponent } from './log-list/log-list.component';
import Keycloak from 'keycloak-js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LogListComponent],
  template: `
    <div class="auth-header" *ngIf="!isAuthenticated">
      <div class="auth-message">
        <h2>Welcome to JLog Flow Dashboard</h2>
        <p>Please log in to access the application.</p>
        <button class="btn btn-primary" (click)="login()">Login</button>
      </div>
    </div>

    <div class="auth-header" *ngIf="isAuthenticated">
      <div class="user-info">
        <span>Welcome, {{ userName }}</span>
        <button class="btn btn-outline-secondary" (click)="logout()">Logout</button>
      </div>
    </div>

    <main *ngIf="isAuthenticated">
      <app-log-list></app-log-list>
    </main>
  `,
  styles: [`
    .auth-header {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .auth-message {
      text-align: center;
      flex: 1;
    }

    .auth-message h2 {
      margin: 0 0 8px 0;
      color: #495057;
    }

    .auth-message p {
      margin: 0 0 16px 0;
      color: #6c757d;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-info span {
      font-weight: 500;
      color: #495057;
    }

    .btn {
      padding: 8px 16px;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .btn-primary:hover {
      background: #0056b3;
      border-color: #0056b3;
    }

    .btn-outline-secondary {
      background: transparent;
      color: #6c757d;
      border-color: #6c757d;
    }

    .btn-outline-secondary:hover {
      background: #6c757d;
      color: white;
    }

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
export class AppComponent implements OnInit {
  private keycloak = inject(Keycloak);
  isAuthenticated = false;
  userName = '';

  async ngOnInit() {
    try {
      if (this.keycloak) {
        this.isAuthenticated = this.keycloak.authenticated;
        if (this.isAuthenticated) {
          const profile = await this.keycloak.loadUserProfile();
          this.userName = profile.firstName || profile.username || 'User';
        }
      } else {
        console.error('KeycloakService not available');
        this.isAuthenticated = false;
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      this.isAuthenticated = false;
    }
  }

  login() {
    if (this.keycloak) {
      this.keycloak.login({
        redirectUri: window.location.origin
      });
    } else {
      console.error('KeycloakService not available for login');
    }
  }

  logout() {
    if (this.keycloak) {
      this.keycloak.logout({ redirectUri: window.location.origin });
    } else {
      console.error('KeycloakService not available for logout');
    }
  }
}
