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
import { NotificationComponent } from './dashboard/notification/notification.component';
import { NotifcationDetailComponent } from './dashboard/notification/notifcation-detail/notifcation-detail.component';
import { ProjectExplorerComponent } from './dashboard/projects/project-explorer/project-explorer.component';
import { MyProjectsComponent } from './dashboard/projects/my-projects/my-projects.component';
import { ProjectTestComponent } from './dashboard/projects/project-test/project-test.component';
import { TestProjetDetailComponent } from './dashboard/projects/project-test/test-projet-detail/test-projet-detail.component';
import {AnalyticsComponent} from './dashboard/analytics/analytics.component';
import { ComplaintsComponent } from './dashboard/complaints/complaints.component';
import { ProjectChatComponent } from './dashboard/projects/project-chat/project-chat.component';
import { EspaceAdminstrativeComponent} from './dashboard/espace-adminstrative/espace-adminstrative.component';
import{ProjectInProgressComponent} from './dashboard/projects/project-in-progress/project-in-progress.component'
import{ProjectTermineComponent} from './dashboard/projects/project-termine/project-termine.component'
import { InitiationPhaseComponent } from './dashboard/task-assignment/initiation-phase/initiation-phase.component';
import { MeetingDetailsComponent } from './dashboard/espace-adminstrative/meeting-details/meeting-details.component';
import { NoteDetailsComponent } from './dashboard/espace-adminstrative/note-details/note-details.component';
import { UserStatsComponent } from './dashboard/user-management/user-stats/user-stats.component';
import { AddComplaintDialogComponent } from './dashboard/espace-adminstrative/add-complaint-dialog/add-complaint-dialog.component';

export const routes: Routes = [
  { 
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: OverviewComponent },
      { path: 'notifications', component: NotificationComponent },
      { path: 'notification/:id', component: NotifcationDetailComponent },
      { path: 'espace-adminstrative', component:EspaceAdminstrativeComponent},
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'upload',   component: UploadComponent },
      { path: 'messages', component: MessagesComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'users',    component: UserManagementComponent },
      { path: 'user/performances/:id',    component: UserStatsComponent },
      { path: 'tâches',   component: TaskAssignmentComponent },
      { path: 'tâches/:id',      component: TaskDetailComponent  },
      { path: 'InitTache/:id', component: InitiationPhaseComponent },
      { path: 'designation', component: DesignationTesteurComponent },
      { path: 'projects',       component: ProjectsComponent },
      { path: 'complaints',       component: ComplaintsComponent },
      { path: 'meetings/:id',       component: MeetingDetailsComponent },
      { path: 'notes/:id',       component: NoteDetailsComponent },
      { path: 'my-projects',       component: MyProjectsComponent },
      { path: 'projects-test', component: ProjectTestComponent },
      { path: 'projects-in-progress',       component: ProjectInProgressComponent },
      { path: 'projects-termine',       component: ProjectTermineComponent },
      { path: 'projects-test/:id',       component: TestProjetDetailComponent },
      { path: 'projects/:id',   component: ProjectDetailsComponent },
      { path: 'projects/:id/explorer', component: ProjectExplorerComponent },
      { path: 'projects/:id/chat', component: ProjectChatComponent },
      { path: 'dashboard/complaint/add', component: AddComplaintDialogComponent}
    ]
  },
  {
    path: 'login',
    loadComponent: () => import(`./login/login.component`)
      .then(mod => mod.LoginComponent)
  },
  { path: '**', component: NotFoundComponent }
];