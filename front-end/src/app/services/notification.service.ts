// src/app/services/notification.service.ts
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, tap } from "rxjs";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { SessionStorageService } from "./session-storage.service";

export interface NotificationDTO {
  id: number;
  type: string;
  payload: string;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private stompClient!: Client;
  private notif$ = new BehaviorSubject<NotificationDTO[]>([]);
  public notifications$ = this.notif$.asObservable();

  constructor(
    private http: HttpClient,
    private session: SessionStorageService
  ) {
    const user = this.session.getUser();
    if (!user?.id) return;

    this.loadInitial(user.id);
    this.connect(user.id);
  }

  private loadInitial(userId: number) {
    this.http
      .get<NotificationDTO[]>(`http://localhost:8080/api/notifications/${userId}`)
      .subscribe(list => this.notif$.next(list));
  }

  private connect(userId: number) {
    const socket = new SockJS("http://localhost:8080/ws");
    this.stompClient = new Client({
      webSocketFactory: () => socket
    });
    this.stompClient.onConnect = () => {
      this.stompClient.subscribe(`/topic/notifications/${userId}`, msg => {
        const n: NotificationDTO = JSON.parse(msg.body);
        this.notif$.next([n, ...this.notif$.value]);
      });
    };
    this.stompClient.activate();
  }

  markRead(id: number) {
    const userId = this.session.getUser()!.id;
    return this.http
      .post(`http://localhost:8080/api/notifications/${userId}/${id}/read`, {})
      .pipe(
        tap(() => {
          const updated = this.notif$.value.map(n =>
            n.id === id ? { ...n, read: true } : n
          );
          this.notif$.next(updated);
        })
      );
  }
}
