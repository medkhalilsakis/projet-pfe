// src/app/services/presence.service.ts
import { Injectable } from '@angular/core';
import { Client, IMessage, StompHeaders } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';
import { SessionStorageService } from './session-storage.service';

export interface PresenceUpdate {
  userId: number;
  online: boolean;
  lastSeen?: string;
}

@Injectable({ providedIn: 'root' })
export class PresenceService {
  private history: PresenceUpdate[] = [];
  private stompClient!: Client;
  private presenceSubject = new BehaviorSubject<PresenceUpdate|null>(null);
  public presence$ = this.presenceSubject.asObservable();

  constructor(private session: SessionStorageService) {
    this.connect();
  }

  public get presenceHistory(): PresenceUpdate[] {
    return [...this.history];
  }

  private connect() {
    const userId = this.session.getUser().id;
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: { 'X-User-Id': `${userId}` }
    });

    this.stompClient.onConnect = () => {
      console.log('WebSocket connecté');
      this.stompClient.subscribe('/topic/presence', (msg: IMessage) => {
        const update: PresenceUpdate = JSON.parse(msg.body);
        // Stocke dans l'historique de présence
        const idx = this.history.findIndex(u => u.userId === update.userId);
        if (idx >= 0) {
          this.history[idx] = update;
        } else {
          this.history.push(update);
        }
        this.presenceSubject.next(update);
      });
    };

    this.stompClient.activate();
    window.addEventListener('beforeunload', () => this.stompClient.deactivate());
  }

  // Méthode pour mettre à jour la présence de l'utilisateur
  updatePresence(userId: number, online: boolean, lastSeen?: string) {
    const update: PresenceUpdate = { userId, online, lastSeen };
    this.presenceSubject.next(update);
    this.history.push(update);  // Ajoute à l'historique
  }
}
