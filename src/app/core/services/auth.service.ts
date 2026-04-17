import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

interface LoginResponse {
  token: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // private baseUrl = 'http://localhost:5115/api/auth';

  //  private baseUrl = 'http://10.132.241.11/backend/api/auth';

   private baseUrl = 'http://164.100.150.78/excise/backend/api/auth'; 


  private TOKEN_KEY = 'token';
  private ROLE_KEY = 'role';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ✅ LOGIN
login(data: { username: string; password: string }) {
  return this.http.post<any>(`${this.baseUrl}/login`, data, {
    responseType: 'text' as 'json' // ✅ UNCOMMENT THIS
  }).pipe(
    tap((res: any) => {
      // ⚠️ res will be string if error, JSON if success
      if (res && typeof res !== 'string' && res.token) {
        this.setSession(res.token, res.role);
      }
    })
  );
}


  // ✅ STORE SESSION
  setSession(token: string, role: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.ROLE_KEY, role);
    }
  }

  // ✅ GET TOKEN
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  // ✅ GET ROLE
  getRole(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.ROLE_KEY);
    }
    return null;
  }

  // ✅ LOGIN CHECK
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ✅ ADMIN CHECK
  isAdmin(): boolean {
    return this.getRole() === 'Admin';
  }

  // ✅ LOGOUT
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.ROLE_KEY);
    }
  }
}