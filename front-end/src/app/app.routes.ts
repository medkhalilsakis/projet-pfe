import { Routes } from '@angular/router';

import { NotFoundComponent } from './not-found/not-found.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './login/auth.guard';
import { ProjectDetailsComponent } from './dashboard/projects/project-details/project-details.component';
import { MessagesComponent } from './dashboard/messages/messages.component';
import { OverviewComponent } from './dashboard/overview/overview.component';
import { DesignationTesteurComponent } from './dashboard/projects/designation-testeur/designation-testeur.component';
import { ProjectsComponent } from './dashboard/projects/projects.component';
import { SettingsComponent } from './dashboard/settings/settings.component';
import { TaskAssignmentComponent } from './dashboard/task-assignment/task-assignment.component';
import { UploadComponent } from './dashboard/upload/upload.component';
import { UserManagementComponent } from './dashboard/user-management/user-management.component';
import { TaskDetailComponent } from './dashboard/task-assignment/task-detail/task-detail.component';
import { NotificationsComponent } from './dashboard/notifications/notifications.component';
import { ProjectExplorerComponent } from './dashboard/projects/project-explorer/project-explorer.component';

export const routes: Routes = [
  { 
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'upload',   component: UploadComponent },
      { path: 'messages', component: MessagesComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'users',    component: UserManagementComponent },
      { path: 'tâches',   component: TaskAssignmentComponent },
      { path: 'tâches/:id',      component: TaskDetailComponent  },
      { path: 'designation', component: DesignationTesteurComponent },
      { path: 'projects',       component: ProjectsComponent },
      { path: 'projects/:id',   component: ProjectDetailsComponent },
      { path: 'projects/:id/explorer', component: ProjectExplorerComponent },
    ]
  },
  {
    path: 'login',
    loadComponent: () => import(`./login/login.component`)
      .then(mod => mod.LoginComponent)
  },
  { path: '**', component: NotFoundComponent }
];