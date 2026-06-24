import { Component } from '@angular/core'; 
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username = '';
  password = '';
  errorMessage = '';
  loading = false;

  // ✅ CAPTCHA
  captchaText: string = '';
  userCaptcha: string = '';
  captchaStyles: any[] = [];

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.generateCaptcha();
  }

  // ✅ Generate CAPTCHA (stable styles)
  generateCaptcha(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    this.captchaText = '';
    this.captchaStyles = [];

    for (let i = 0; i < 6; i++) {
      const char = chars.charAt(Math.floor(Math.random() * chars.length));
      this.captchaText += char;

      // generate style ONCE (no flicker)
      this.captchaStyles.push(this.generateStyle());
    }
  }

  // ✅ Style generator
  generateStyle(): any {
    const rotations = [-25, -15, 0, 15, 25];
    const colors = ['#38bdf8', '#facc15', '#f87171', '#4ade80'];

    return {
      transform: `rotate(${rotations[Math.floor(Math.random() * rotations.length)]}deg)`,
      color: colors[Math.floor(Math.random() * colors.length)],
      fontSize: `${18 + Math.random() * 8}px`,
      opacity: 0.6 + Math.random() * 0.4
    };
  }

  login(): void {
    this.errorMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Username and Password are required';
      return;
    }

    // ✅ CAPTCHA CHECK
    if (this.userCaptcha !== this.captchaText) {
      this.errorMessage = 'Invalid captcha';
      this.generateCaptcha();
      this.userCaptcha = '';
      return;
    }

    this.loading = true;

    this.auth.login({
      username: this.username,
      password: this.password
    }).subscribe({
  next: (res: any) => {

    let data = res;

    // ✅ convert string → JSON (because of responseType: 'text')
    if (typeof res === 'string') {
      try {
        data = JSON.parse(res);
      } catch (e) {
        console.error('Invalid JSON response', e);
        this.errorMessage = 'Server error';
        this.loading = false;
        return;
      }
    }

    // ✅ ensure token exists
    if (!data?.token) {
      this.errorMessage = 'Invalid login response';
      this.loading = false;
      return;
    }

    // ✅ store token
    this.auth.setSession(data.token, data.role);

    // console.log('Login successful', data);
    // console.log('Token stored:', this.auth.getToken());

this.auth.setSession(data.token, data.role);

// Store login timestamp
localStorage.setItem(
  'loginTime',
  Date.now().toString()
);

this.loading = false;

this.router.navigate(['/admin/dashboard']);
  },

  error: (err: any) => {

    // ✅ plain text error (your backend case)
    if (typeof err.error === 'string') {
      this.errorMessage = err.error;
    } 
    // ✅ JSON error
    else if (err.error?.message) {
      this.errorMessage = err.error.message;
    } 
    // ✅ fallback
    else {
      this.errorMessage = 'Invalid username or password';
    }

    this.loading = false;
    this.generateCaptcha();
  }
});
  }
}