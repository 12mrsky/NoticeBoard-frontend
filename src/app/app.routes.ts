import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { NoticeComponent } from './features/admin/notice/notice.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },


  {
    path: 'admin',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: 'notice', component: NoticeComponent }, // ✅ only this
      { path: '', redirectTo: 'notice', pathMatch: 'full' } // 🔥 default
    ]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: '**', redirectTo: 'login' }
];