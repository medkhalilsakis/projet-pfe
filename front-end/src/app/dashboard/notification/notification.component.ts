import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';
import { CommonModule } from '@angular/common';
import { SessionStorageService } from '../../services/session-storage.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import {ActivatedRoute, Router} from '@angular/router'
@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: any[] = [];

  @ViewChild(NotificationPopupComponent)
  popupComponent!: NotificationPopupComponent;

  constructor(private http: HttpClient,private notifService: NotificationService,private sessionStorage: SessionStorageService,private router : Router, private route :ActivatedRoute) {}

  ngOnInit() {
    console.log("halo ")
    const currentUserId = this.sessionStorage.getUser().id;
    const currentUserrole = this.sessionStorage.getUser().roleId;
    this.getNotifications();
    console.log(this.notifications)
    this.notifService.connect(currentUserId);
    this.notifService.refreshUserNotifications(currentUserId); // <-- 🔹 Add this line here

    
        
  }/*
  navigateTo(view: string, queryParams: Record<string, any> = {}) {
    this.router.navigate(
      [view],
      { relativeTo: this.route, queryParams }
    );
  }*/
  getNotifications() {
    const user = this.sessionStorage.getUser();

    this.http.get<any[]>(`http://localhost:8080/api/notifications/user/${user.id}`).subscribe({
      next: (data) => {
        this.notifications = data;
        console.log(this.notifications)

  },
      error: (e) => {
        console.log(e);
        }
    });
}


 viewNotificationDetails(notification: any) {
  const currentUserId = this.sessionStorage.getUser().id;

       this.markAsRead(notification.id).subscribe({
         next: () => {
           this.notifService.refreshUserUnreadNotifications(currentUserId);
      this.router.navigate(['../notification', notification.id], { relativeTo: this.route });
         }
     });
    
   }
   markAsRead(id: number): Observable<any> {
    const currentUserId = this.sessionStorage.getUser().id;

       return this.notifService.markAsRead(currentUserId,id);
   
       //return this.http.post(`http://localhost:8080/api/notifications/user/${this.currentUser.id}/${id}/mark-read`, {});
     }

}
