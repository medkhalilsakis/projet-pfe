import { Routes } from '@angular/router';

import { NotFoundComponent } from './not-found/not-found.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './login/auth.guard';
import { OverviewComponent } from './dashboard/overview/overview.component';
import { ProjectsComponent } from './dashboard/projects/projects.component';
import { MessagesComponent } from './dashboard/messages/messages.component';

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
  {
    path: 'signup',
    loadComponent: () => import(`./register/register.component`)
      .then(mod => mod.RegisterComponent)
  },
  { path: '**', component: NotFoundComponent }
];