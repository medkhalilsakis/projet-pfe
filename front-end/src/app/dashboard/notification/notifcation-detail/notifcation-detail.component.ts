import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router'
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SessionStorageService } from '../../../services/session-storage.service';
import {NotificationService} from "../../../services/notification.service";
import { Observable } from 'rxjs';
@Component({
  selector: 'app-notifcation-detail',
  imports: [CommonModule],
  templateUrl: './notifcation-detail.component.html',
  styleUrl: './notifcation-detail.component.css'
})
export class NotifcationDetailComponent implements OnInit {

  @Output() taskSelected = new EventEmitter<any>();
  @Output() discussionSelected = new EventEmitter<any>();
  notificationId!: number;
  notification : any ={}
  constructor(private http: HttpClient,private notifService: NotificationService,private route: ActivatedRoute,private sessionStorage: SessionStorageService,private router : Router) {}

  viewTaskDetails(task: any) {
      this.router.navigate(['../../tâches',task.id], { relativeTo: this.route });
}
viewProjectDetails(project: any) {
      this.router.navigate(['../../projects',project.id], { relativeTo: this.route });
}
viewMessageDetails(chatMessage: any) {
      this.router.navigate(['../../messages'], { relativeTo: this.route });
}
ngOnInit(): void {
 const notificationId = this.route.snapshot.paramMap.get('id');
    if (notificationId) {
this.loadNotification(+notificationId);
    }
  }
    loadNotification(id: number): void {
    this.notifService.getNotificationById(id).subscribe({
      next: (notif) => {
        this.notification = notif;
        console.log('Notification:', notif);
      },
      error: (err) => {
        console.error('Error fetching notification:', err);
      }
    });
  }

markAsRead(id: number): Observable<any> {
    const currentUserId = this.sessionStorage.getUser().id;

       return this.notifService.markAsRead(currentUserId,id);
   
       //return this.http.post(`http://localhost:8080/api/notifications/user/${this.currentUser.id}/${id}/mark-read`, {});
     }
}
