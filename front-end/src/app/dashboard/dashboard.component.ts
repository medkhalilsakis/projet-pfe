import { Component, inject, signal ,OnInit,ViewChild, Output, EventEmitter, computed } from '@angular/core';
  import { SessionStorageService } from '../services/session-storage.service';
  import { Router, RouterModule } from '@angular/router';
  import { MatSidenavModule } from '@angular/material/sidenav';
  import { MatToolbarModule } from '@angular/material/toolbar';
  import { MatListModule } from '@angular/material/list';
  import { MatIconModule } from '@angular/material/icon';
  import { CommonModule, NgSwitch, NgSwitchCase } from '@angular/common';
  import { OverviewComponent } from './overview/overview.component';
  import { SettingsComponent } from './settings/settings.component';
  import { ProjectsComponent } from './projects/projects.component';
  import { MessagesComponent } from './messages/messages.component';
  import { TaskBoadComponent } from './task-boad/task-boad.component';
  import { MatMenuModule } from '@angular/material/menu';
  import { MatBadgeModule } from '@angular/material/badge';
  import { NotificationService } from '../services/notification.service';
  import { UploadComponent } from './upload/upload.component';
  import { AddUserComponent } from './add-user/add-user.component';
  import { MatExpansionModule } from '@angular/material/expansion';
  import { DesignationTesteurComponent } from './projects/designation-testeur/designation-testeur.component';
  import { TaskDetailComponent } from './task-boad/task-detail/task-detail.component';
  import { AnalyticsComponent } from './analytics/analytics.component';
  import { NotificationComponent } from "./notification/notification.component";
  import { NotificationPopupComponent } from './notification-popup/notification-popup.component';
  import { HttpClient } from '@angular/common/http';
  import { NotifcationDetailComponent } from "./notification/notifcation-detail/notifcation-detail.component";
  import { Observable } from 'rxjs';
  @Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: true,
    imports: [
      NotifcationDetailComponent,
      TaskDetailComponent,
      CommonModule,
      RouterModule,
      MatMenuModule,
      MatBadgeModule,
      MatSidenavModule,
      MatToolbarModule,
      MatListModule,
      MatIconModule,
      OverviewComponent,
      NotificationPopupComponent,
      SettingsComponent,
      ProjectsComponent,
      MessagesComponent,
      TaskBoadComponent,
      NgSwitch,
      NgSwitchCase,
      UploadComponent,
      AddUserComponent,
      MatExpansionModule,
      DesignationTesteurComponent,
      AnalyticsComponent,
      NotificationComponent
  ],
  })
  export class DashboardComponent implements OnInit {
    currentView = signal<string>('overview');
    notifications = signal<any[]>([]);
    unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);
    @ViewChild(NotificationPopupComponent)
    popupComponent!: NotificationPopupComponent;
    
    currentUser: any;
    menuItems: any[] = [];

    constructor(private http: HttpClient,
      private sessionService: SessionStorageService,
      private router: Router,
      private notifService: NotificationService
    ) {
      this.currentUser = this.sessionService.getUser();
      this.buildMenu();
      this.notifService.refreshUserUnreadNotifications(this.currentUser.id);
    }
    ngOnInit() {
      const currentUserId = this.currentUser.id;
      this.notifService.refreshUserUnreadNotifications(currentUserId);
      console.log(this.notifications())
      this.notifService.unreadnotifications$.subscribe(data => {
        this.notifications.set(data);
        console.log(this.notifications())

      });
      this.notifService.connect(currentUserId);
    
      this.notifService.notifications$.subscribe(data => {
        const updatedNotifications = [...this.notifications(), ...data];
        this.notifications.set(updatedNotifications);
              if (data.length > 0) {
          this.popupComponent.showNotification(data[0]);
        }
      });
    }

    /*loadNotifications() {

      this.http.get<any[]>(`http://localhost:8080/api/notifications/user/${this.currentUser.id}/unread`).subscribe({
        next: (data) => {
          this.notifications.set(data);

    },
        error: (e) => {
          console.log(e);
          }
      });
    }**/
    navigateTo(view: string) {
      console.log('Navigating to:', view); // Add this line
      this.currentView.set(view);
      history.replaceState(null, '', '/dashboard');
    }

    private buildMenu() {
      const role = this.currentUser.role.id;
      const baseMenu = [
        { label: 'Vue d\'ensemble', icon: 'dashboard', action: () => this.navigateTo('overview') },
        { label: 'Upload Projet', icon: 'cloud_upload', action: () =>{
          this.selectedTask.set(null); // Clear task when from menu
          this.navigateTo('upload') }
        } ,

        { label: 'Messagerie', icon: 'message', action: () => this.navigateTo('messages') },
        { label: 'Analytics', icon: 'insights', action: () => this.navigateTo('analytics') },
        { label: 'Notifications', icon: 'notifications', action: () => this.navigateTo('notifications') },
        { label: 'Paramètres', icon: 'settings', action: () => this.navigateTo('settings') },
      ];
    

      switch(role) {
        case 3: // Superviseur
          this.menuItems = [
            ...baseMenu,
            { label: 'tâches', icon: 'assignment_turned_in', action: () => this.navigateTo('tâches') },

            {
              label: 'Liste des Projets',
              icon: 'list_alt',
              subMenu: [
                { label: 'Vue d\'ensemble', action: () => this.navigateTo('projects') },
                { label: 'Désignation des testeurs', action: () => this.navigateTo('designation') },
                { label: 'Projets en révision',     action: () => this.navigateTo('projects/revision')   },
                { label: 'Réclamations',             action: () => this.navigateTo('projects/complaints') },
                { label: 'Projets archivés',         action: () => this.navigateTo('projects/archived')   },
                { label: 'Projets terminés',         action: () => this.navigateTo('projects/completed')  },
              ]
            },
            { label: 'Ajouter Utilisateur', icon: 'add', action: () => this.navigateTo('add-user') },
            { label: 'Utilisateurs', icon: 'people', action: () => this.navigateTo('users') }
          ];
          break;
        
        case 2: // Testeur
          this.menuItems = [
            ...baseMenu,

            {
              label: 'Liste des Projets',
              icon: 'list_alt',
              subMenu: [

                { label: 'Projets à tester', icon: 'assignment', action: () => this.navigateTo('projects') },
      
                { label: 'Projets en cours', icon: 'hourglass_empty', action: () => this.navigateTo('projects?type=in-progress') },
                { label: 'Projets terminés', icon: 'assignment_turned_in', action: () => this.navigateTo('projects?type=completed') }
                ]
            },
            
          ];
          break;

        case 1: // Développeur
          this.menuItems = [
            ...baseMenu,
            { label: 'tâches', icon: 'assignment_turned_in', action: () => this.navigateTo('tâches') },
            { label: 'Mes Projets', icon: 'folder', action: () => this.navigateTo('projects') },
          ];
          break;
      }
    }
    selectedTask = signal<any>(null);

  viewTaskDetails(task: any) {
    this.selectedTask.set(task);
    this.currentView.set('task-detail');
  }
  selectedMessage = signal<any>(null);

  viewMessageDetails(message: any) {
    this.selectedMessage.set(message);
    this.currentView.set('messages');
  }

  selectedNoti = signal<any>(null);

  viewNotiDetails(notification: any) {
    this.selectedNoti.set(notification);
    this.currentView.set('notifcation-detail');
  }
  @Output() notiSelected = new EventEmitter<any>();

  viewNotificationDetails(notification: any) {
    const currentUserId = this.currentUser.id;

      this.markAsRead(notification.id).subscribe({
        next: () => {
          this.notifService.refreshUserUnreadNotifications(currentUserId);
          this.selectedNoti.set(notification);
          this.currentView.set('notifcation-detail');
        },
      
    });
  }
  
  markAsRead(id: number): Observable<any> {
    return this.notifService.markAsRead(this.currentUser.id,id);

  }

  goToUpload(task: any) {
    this.selectedTask.set(task);
    this.currentView.set('upload');
  }


    logout() {
      this.sessionService.clearStorage();
      this.router.navigate(['/login']);
    }
  }