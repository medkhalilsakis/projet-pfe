import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SessionStorageService } from '../../services/session-storage.service';
import { NotificationService } from '../../services/notification.service';
import { Observable } from 'rxjs/internal/Observable';
import {ActivatedRoute, Router} from '@angular/router'

@Component({
  selector: 'app-notification-popup',
  templateUrl: './notification-popup.component.html',
  imports: [CommonModule],
  styleUrls: ['./notification-popup.component.css']
})
export class NotificationPopupComponent {
  @Input() notification: any;
  visible: boolean = false;
  currentUser: any;

  constructor(
    private sessionService: SessionStorageService,private notifService: NotificationService,private router : Router, private route :ActivatedRoute
  ) {
    this.currentUser = this.sessionService.getUser();
  }
  
  navigateTo(view: string, queryParams: Record<string, any> = {}) {
    this.router.navigate(
      [view],
      { relativeTo: this.route, queryParams }
    );
  }

  showNotification(notification: any) {
    this.notification = notification;
    this.visible = true;

    setTimeout(() => {
      this.visible = false;
    }, 20000); // hide after 20 seconds
  }

 viewNotificationDetails(notification: any) {
  const currentUserId = this.currentUser.id;

       this.markAsRead(notification.id).subscribe({
         next: () => {
           this.notifService.refreshUserUnreadNotifications(currentUserId);
      this.router.navigate(['notification', notification.id], { relativeTo: this.route });
         }
     });
    
   }
   markAsRead(id: number): Observable<any> {
    const currentUserId = this.currentUser.id;

       return this.notifService.markAsRead(currentUserId,id);
   
       //return this.http.post(`http://localhost:8080/api/notifications/user/${this.currentUser.id}/${id}/mark-read`, {});
     }

}


