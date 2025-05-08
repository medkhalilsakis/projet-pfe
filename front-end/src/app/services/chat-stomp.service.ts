// src/app/services/chat-stomp.service.ts
import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage } from '../dashboard/projects/project-chat/project-chat.component';

@Injectable({ providedIn: 'root' })
export class ChatStompService {
  private client: Client;
  /** émet `true` dès que la connexion est prête */
  public connected$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: str => console.debug('[STOMP]', str)
    });

    this.client.onConnect = () => this.connected$.next(true);
    this.client.onStompError = frame => console.error('[STOMP error]', frame);

    this.client.activate();
  }

  /**
   * Observe les messages “publics” (désormais tout est public)
   * souscription propre : teardown des deux souscriptions
   */
  watchPublic(projectId: number): Observable<ChatMessage> {
    return new Observable(subscriber => {
      // 1) Souscription à l’état de connexion
      const connSub = this.connected$.subscribe(ready => {
        if (!ready) {
          return;
        }
        // 2) Dès qu’on est connecté, on s’abonne au topic du projet
        const stompSub = this.client.subscribe(
          `/topic/pchats/${projectId}`,
          (msg: IMessage) => {
            const body: ChatMessage = JSON.parse(msg.body);
            subscriber.next(body);
          }
        );
        // On n’a plus besoin de la souscription “connected$”
        connSub.unsubscribe();

        // Quand l’observable est complété / unsubscribed, on nettoie la souscription STOMP
        subscriber.add(() => {
          stompSub.unsubscribe();
        });
      });

      // Teardown : si l’abonné se désabonne avant connexion
      return () => {
        connSub.unsubscribe();
      };
    });
  }

  /**
   * Envoie un message “public” (tout est public)
   */
  sendMessage(projectId: number, payload: any) {
    if (!this.connected$.value) {
      console.warn('STOMP non connecté, message ignoré');
      return;
    }
    this.client.publish({
      destination: `/app/pchats/${projectId}`,
      body: JSON.stringify(payload)
    });
  }
}
