import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  login(credentials: any): Observable<any> {
    localStorage.setItem('access_token', 'test_token_123');
    return of({ success: true });
  }

  logout() {
    localStorage.removeItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}
