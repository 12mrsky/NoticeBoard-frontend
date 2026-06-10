import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login.component';
import { NoticeComponent } from './features/admin/notice/notice.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],

    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'notice',
        component: NoticeComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];