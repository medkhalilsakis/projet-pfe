import { Component, inject, signal, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { SessionStorageService } from '../services/session-storage.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, NgSwitch, NgSwitchCase } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';

import { NotificationService } from '../services/notification.service';
import { ProfileImageService } from '../services/profile-image.service';

import { OverviewComponent } from './overview/overview.component';
import { ProjectsComponent } from './projects/projects.component';
import { MessagesComponent } from './messages/messages.component';
import { UploadComponent } from './upload/upload.component';
import { AddUserComponent } from './add-user/add-user.component';
import { DesignationTesteurComponent } from './projects/designation-testeur/designation-testeur.component';
import { SettingsComponent } from './settings/settings.component';
import { TaskAssignmentComponent } from './task-assignment/task-assignment.component';

import { Subscription } from 'rxjs';
import { UserManagementComponent } from "./user-management/user-management.component";

@Component({
  selector: 'app-dashboard',
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
    MatExpansionModule
],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('profileFileInput', { read: ElementRef }) 
  profileFileInput!: ElementRef<HTMLInputElement>;

  currentView = signal<string>('overview');
  notifications = signal<any[]>([]);
  profileImageUrl: string|null = null;
  currentUser: any;
  menuItems: any[] = [];

  private session = inject(SessionStorageService);
  private http = inject(HttpClient);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  private route            = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);
  private profileImageService = inject(ProfileImageService);

  private sub!: Subscription;

  ngOnInit(): void {
    // 1) Charger l'utilisateur dès ngOnInit
    this.currentUser = this.session.getUser();

    // 2) Construire le menu avant la première détection
    this.buildMenu();

    // 3) Charger notifications si besoin
    this.loadNotifications();

    // 4) Charger l'image de profil & s'abonner aux mises à jour
    this.loadProfileImage();
    this.sub = this.profileImageService.imageUrl$.subscribe(url => {
      this.profileImageUrl = url;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private loadProfileImage(): void {
    const userId = this.currentUser.id;
    this.http.get<any>(`http://localhost:8080/api/users/${userId}/profile-image/meta`)
      .subscribe({
        next: meta => {
          const url = meta?.filePath
            ? `http://localhost:8080/api/users/${userId}/profile-image/raw?ts=${Date.now()}`
            : null;
          this.profileImageService.setImageUrl(url);
        },
        error: () => {
          this.profileImageService.setImageUrl(null);
        }
      });
  }

  onProfileFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const form = new FormData();
    form.append('file', file);

    this.http.post(
      `http://localhost:8080/api/users/${this.currentUser.id}/profile-image`,
      form
    ).subscribe({
      next: () => {
        this.snack.open('Photo de profil mise à jour', 'Fermer', { duration: 2000 });
        this.loadProfileImage();
      },
      error: () => {
        this.snack.open('Échec de l’upload', 'Fermer', { duration: 2000 });
      }
    });
  }

  triggerProfilePicker(): void {
    this.profileFileInput.nativeElement.click();
  }

  //navigateTo(view: string): void {
  //  this.currentView.set(view);
  //  history.replaceState(null, '', '/dashboard');
  //}

  navigateTo(view: string): void {
    this.router.navigate([view], { relativeTo: this.route });
  }

  private loadNotifications(): void {
    // … votre logique de notifications …
  }

  private buildMenu(): void {
    const role = this.currentUser.role.id;
    const baseMenu = [
      { label: 'Vue d\'ensemble', icon: 'dashboard',    action: () => this.navigateTo('overview') },
      { label: 'Upload Projet',   icon: 'cloud_upload', action: () => this.navigateTo('upload')   },
      { label: 'Messagerie',      icon: 'message',      action: () => this.navigateTo('messages') },
      { label: 'Notifications',   icon: 'notifications',action: () => this.navigateTo('notifications') },
      { label: 'Paramètres',      icon: 'settings',     action: () => this.navigateTo('settings') },
      { label: 'Analytics',      icon: 'analytics',     action: () => this.navigateTo('analytics') },
    ];

    if (role === 3) {
      this.menuItems = [
        ...baseMenu,
        { label: 'tâches', icon: 'assignment_turned_in', action: () => this.navigateTo('tâches') },
        {
          label: 'Projets', icon: 'list_alt',
          subMenu: [
            { label: 'Vue d\'ensemble',      action: () => this.navigateTo('projects') },
            { label: 'Désignation testeurs', action: () => this.navigateTo('designation') },
            { label: 'Projets en révision',  action: () => this.navigateTo('projects/revision') },
            { label: 'Réclamations',         action: () => this.navigateTo('projects/complaints') },
            { label: 'Projets archivés',     action: () => this.navigateTo('projects/archived') },
            { label: 'Projets terminés',     action: () => this.navigateTo('projects/completed') }
          ]
        },
        { label: 'Gestion Utilisateurs',  icon: 'people', action: () => this.navigateTo('users') }
      ];
    }
    else if (role === 2) {
      this.menuItems = [
        ...baseMenu,
        { label: 'Projets à tester', icon: 'assignment',      action: () => this.navigateTo('projects?type=to-test') },
        { label: 'Projets en cours', icon: 'hourglass_empty', action: () => this.navigateTo('projects?type=in-progress') },
        { label: 'Projets terminés', icon: 'assignment_turned_in', action: () => this.navigateTo('projects?type=completed') }
      ];
    }
    else {
      this.menuItems = [
        ...baseMenu,
        { label: 'tâches', icon: 'assignment_turned_in', action: () => this.navigateTo('tâches') },
        { label: 'Mes Projets', icon: 'folder',         action: () => this.navigateTo('projects') }
      ];
    }
  }

  logout(): void {
    this.session.clearStorage();
    this.router.navigate(['/login']);
  }
}
