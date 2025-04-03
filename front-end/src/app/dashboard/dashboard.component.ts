import { Component, inject, signal } from '@angular/core';
import { SessionStorageService } from '../services/session-storage.service';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgSwitch, NgSwitchCase } from '@angular/common';
import { OverviewComponent } from './overview/overview.component';
import { ProjectsComponent } from './projects/projects.component';
import { MessagesComponent } from './messages/messages.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationService } from '../services/notification.service';
import { UploadComponent } from './upload/upload.component';
import { AddUserComponent } from './add-user/add-user.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatBadgeModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    OverviewComponent,
    ProjectsComponent,
    MessagesComponent,
    NgSwitch,
    NgSwitchCase,
    UploadComponent,
    AddUserComponent
  ],
})
export class DashboardComponent {
  currentView = signal<string>('overview');
  notifications = signal<any[]>([]);
  private notificationService = inject(NotificationService);

  currentUser: any;
  menuItems: any[] = [];

  constructor(
    private sessionService: SessionStorageService,
    private router: Router
  ) {
    this.currentUser = this.sessionService.getUser();
    this.buildMenu();
    this.loadNotifications();
  }
  private async loadNotifications() {
    //const notifications = await this.notificationService.getUserNotifications();
    //this.notifications.set(notifications);
  }
  navigateTo(view: string) {
    this.currentView.set(view);
    history.replaceState(null, '', '/dashboard');
  }

  private buildMenu() {
    const role = this.currentUser.role.id;
    const baseMenu = [
      { label: 'Vue d\'ensemble', icon: 'dashboard', action: () => this.navigateTo('overview') },
      { label: 'Upload Projet', icon: 'cloud_upload', action: () => this.navigateTo('upload') },
      { label: 'Messagerie', icon: 'message', action: () => this.navigateTo('messages') },
      { label: 'Analytics', icon: 'insights', action: () => this.navigateTo('analytics') },
      { label: 'Paramètres', icon: 'settings', action: () => this.navigateTo('settings') },
    ];
  

    switch(role) {
      case 3: // Superviseur
        this.menuItems = [
          ...baseMenu,
          { label: 'Liste des Projets', icon: 'list_alt', action: () => this.navigateTo('projects') },
          { label: 'Utilisateurs', icon: 'people', action: () => this.navigateTo('users') },
          { label: 'Notifications', icon: 'notifications', action: () => this.navigateTo('notifications') },
          { label: 'Ajouter Utilisateur', icon: 'add', action: () => this.navigateTo('add-user') },
        ];
        break;
      
      case 2: // Testeur
        this.menuItems = [
          ...baseMenu,
          { label: 'Projets à tester', icon: 'assignment', action: () => this.navigateTo('projects?type=to-test') },
          { label: 'Projets en cours', icon: 'hourglass_empty', action: () => this.navigateTo('projects?type=in-progress') },
          { label: 'Projets terminés', icon: 'assignment_turned_in', action: () => this.navigateTo('projects?type=completed') }
        ];
        break;

      case 1: // Développeur
        this.menuItems = [
          ...baseMenu,
          { label: 'Mes Projets', icon: 'folder', action: () => this.navigateTo('projects') },
          { label: 'Notifications', icon: 'notifications', action: () => this.navigateTo('notifications') }
        ];
        break;
    }
  }

  logout() {
    this.sessionService.clearStorage();
    this.router.navigate(['/login']);
  }
}