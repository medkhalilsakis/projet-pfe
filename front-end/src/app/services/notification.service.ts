// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client, Message, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface NotificationDTO {
  id: number;
  type: string;
  payload: string;
  read: boolean;
  createdAt: string;
}
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private stompClient!: Client;
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  private unreadnotificationsSubject = new BehaviorSubject<any[]>([]);

  notifications$ = this.notificationsSubject.asObservable();
  unreadnotifications$ = this.unreadnotificationsSubject.asObservable();

  private subscription?: StompSubscription;
  private reloadTrigger = new Subject<void>();

  reloadNeeded$ = this.reloadTrigger.asObservable();

  constructor(private http: HttpClient) {}

  connect(userId: number) {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000
    });

    this.stompClient.onConnect = () => {
      console.log('Connected to WebSocket');
      this.subscription = this.stompClient.subscribe(
        `/topic/notifications/${userId}`,
        (message: Message) => {
          console.log('[STOMP raw message]', message);
          this.handleIncomingPush(message)
          let notification;
          try {
            notification = JSON.parse(message.body);
          } catch (e) {
            console.error('JSON parse error', e, message.body);
            return;
          }
          console.log('[Parsed notification]', notification);
          // now push or show it
          const current = this.notificationsSubject.value;
          this.notificationsSubject.next([notification, ...current]);
        }
      );
    };
    this.stompClient.onWebSocketError = (err) => console.error('WebSocket error', err);

    this.stompClient.onStompError = (frame) => {
      console.error('Broker error: ', frame.headers['message']);
      console.error('Details: ', frame.body);
    };

    this.stompClient.activate(); // Start the connection
  }

  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
      console.log('Disconnected from WebSocket');
    }
  }
  
  markAsRead(userId: number, notificationId: number) {
    return this.http
      .post(`http://localhost:8080/api/notifications/user/${userId}/${notificationId}/mark-read`, {})
      
      .pipe(
        tap(() => {
          console.log(this.unreadnotifications$)
          // tell anyone listening that they should reload
          this.reloadTrigger.next();
        })
      );
  }
  private handleIncomingPush(raw: Message) {
    const notif = JSON.parse(raw.body);
    // … your existing logic to prepend into subjects …
    this.reloadTrigger.next();
  }


refreshUserNotifications(userId: number) {
  console.log("trfghkjljytdgfghhj")
  this.http.get<any[]>(`http://localhost:8080/api/notifications/user/${userId}`).subscribe((data) => {
    this.notificationsSubject.next(data);
  });
}
refreshUserUnreadNotifications(userId: number) {
  console.log("unreaaaad")
  this.http.get<any[]>(`http://localhost:8080/api/notifications/user/${userId}/unread`).subscribe((data) => {
    this.unreadnotificationsSubject.next(data);
  });
}
getNotificationById(id: number): Observable<any> {
  return this.http.get<any>(`http://localhost:8080/api/notifications/${id}`);
}

}

