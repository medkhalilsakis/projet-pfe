import { Routes } from '@angular/router';

import { NotFoundComponent } from './not-found/not-found.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './login/auth.guard';

export const routes: Routes = [
  { 
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: []
  },
  {
    path: 'login',
    loadComponent: () => import(`./login/login.component`)
      .then(mod => mod.LoginComponent)
  },
  { path: '**', component: NotFoundComponent }
];