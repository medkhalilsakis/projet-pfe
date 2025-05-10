import { Component, inject, signal, OnInit, OnDestroy, ElementRef, ViewChild, computed } from '@angular/core';
import { SessionStorageService } from '../services/session-storage.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { ProfileImageService } from '../services/profile-image.service';
import { PresenceService, PresenceUpdate } from '../services/presence.service';
import { Observable, Subscription } from 'rxjs';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NotificationService } from '../services/notification.service';
import { NotificationPopupComponent } from './notification-popup/notification-popup.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,   
    MatSidenavModule,
    MatMenuModule,
    MatBadgeModule,
    MatMenuModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    NotificationPopupComponent,
    MatExpansionModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('profileFileInput', { read: ElementRef }) 
  profileFileInput!: ElementRef<HTMLInputElement>;

  @ViewChild(NotificationPopupComponent)
  popupComponent!: NotificationPopupComponent;
    

  presenceMap = new Map<number, PresenceUpdate>();

  currentView = signal<string>('overview');
  sideNavOpen = signal(true);
  notifications = signal<any[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);  profileImageUrl: string|null = null;
  currentUser: any;
  menuItems: any[] = [];

  private session = inject(SessionStorageService);
  private notifService = inject(NotificationService);

  private http = inject(HttpClient);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  private route            = inject(ActivatedRoute);
  private profileImageService = inject(ProfileImageService);
  private presenceService = inject(PresenceService);

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


    this.presenceService.updatePresence(this.currentUser.id, true);
  }


  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.presenceService.updatePresence(this.currentUser.id, false, new Date().toISOString());
  }

  toggleSideNav() {
    this.sideNavOpen.update(open => !open);
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

  navigateTo(view: string, queryParams: Record<string, any> = {}) {
    this.router.navigate(
      [view],
      { relativeTo: this.route, queryParams }
    );
  }

  private loadNotifications(): void {
const UserId = this.currentUser.id;
      this.notifService.refreshUserUnreadNotifications(UserId);
      console.log(this.notifications())
      this.notifService.unreadnotifications$.subscribe(data => {
        this.notifications.set(data);
        console.log(this.notifications())

      });
      this.notifService.connect(UserId);
    
      this.notifService.notifications$.subscribe(data => {
        const updatedNotifications = [...this.notifications(), ...data];
        this.notifications.set(updatedNotifications);
              if (data.length > 0) {
          this.popupComponent.showNotification(data[0]);
        }
      });
    }  

  private buildMenu(): void {
    const role = this.currentUser.role.id;
    const baseMenu = [
      { label: 'Vue d\'ensemble', icon: 'dashboard',    action: () => this.navigateTo('overview') },
      { label: 'Upload Projet',   icon: 'cloud_upload', action: () => this.navigateTo('upload')   },
      { label: 'Messagerie',      icon: 'message',      action: () => this.navigateTo('messages') },
      { label: 'Notifications',   icon: 'notifications',action: () => this.navigateTo('notifications') },
      { label: 'Analytics',      icon: 'analytics',     action: () => this.navigateTo('analytics') },
    ];

    if (role === 3) {
      this.menuItems = [
        ...baseMenu,
        { label: 'Tâches', icon: 'assignment_turned_in', action: () => this.navigateTo('tâches') },
        {
          label: 'Projets', icon: 'list_alt',
          subMenu: [
            { label: 'Vue d\'ensemble',      action: () => this.navigateTo('projects') },
            { label: 'Mes Projets',           action: () => this.navigateTo('my-projects') },
            { label: 'Désignation testeurs',  action: () => this.navigateTo('designation') },
            { label: 'Projets en révision',   action: () => this.navigateTo('projects', { status: 'accept' }) },
            { label: 'Réclamations',          action: () => this.navigateTo('complaints') },
            { label: 'Projets archivés',      action: () => this.navigateTo('projects', { status: 'archived' }) },
            { label: 'Projets terminés',      action: () => this.navigateTo('projects', { status: 'done' }) },
          ]
        },
        { label: 'Gestion Utilisateurs',  icon: 'people', action: () => this.navigateTo('users') }
      ];
    }
    else if (role === 2) {
      this.menuItems = [
        ...baseMenu,
        { label: 'Projets à tester', icon: 'assignment',      action: () => this.navigateTo('projects-test') },
        { label: 'Projets en cours', icon: 'hourglass_empty', action: () => this.navigateTo('projects-in-progress') },
        { label: 'Projets terminés', icon: 'assignment_turned_in', action: () => this.navigateTo('projects?type=completed') }
      ];
    }
    else {
      this.menuItems = [
        ...baseMenu,
        { label: 'Tâches', icon: 'assignment_turned_in', action: () => this.navigateTo('tâches') },
        { label: 'Mes Projets', icon: 'folder', action: () => this.navigateTo('my-projects') }
      ];
    }
  }

  
  selectedNoti = signal<any>(null);

  viewNotiDetails(notification: any) {
    this.navigateTo('/notification',notification.id)
  }

   viewNotificationDetails(notification: any) {
  const currentUserId = this.currentUser  .id;

       this.markAsRead(notification.id).subscribe({
         next: () => {
           this.notifService.refreshUserUnreadNotifications(currentUserId);
      this.router.navigate(['notification', notification.id], { relativeTo: this.route });
         }
     });
    
   }
  
  markAsRead(id: number): Observable<any> {
    return this.notifService.markAsRead(this.currentUser.id,id);

  }

  logout(): void {
    this.session.clearStorage();
    this.router.navigate(['/login']);
  }
}
