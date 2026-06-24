import {
  Injectable,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';

import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {

  private timeoutId: any;
  private readonly IDLE_TIME = 5 * 60 * 1000;

  constructor(
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    if (isPlatformBrowser(this.platformId)) {
      this.initListener();
    }

  }

  private initListener(): void {

    const events = [
      'mousemove',
      'mousedown',
      'click',
      'scroll',
      'keypress',
      'touchstart'
    ];

    events.forEach(event => {
      window.addEventListener(event, () => {
        this.resetTimer();
      });
    });

    this.startTimer();
  }

  private startTimer(): void {

    this.timeoutId = setTimeout(() => {

      if (this.auth.isLoggedIn()) {

        this.auth.logout();

        this.router.navigate(['/login']);
      }

    }, this.IDLE_TIME);
  }

  private resetTimer(): void {

    clearTimeout(this.timeoutId);

    this.startTimer();
  }
}