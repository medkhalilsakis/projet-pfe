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
      // pour SockJS – correspond à votre @EnableWebSocketMessageBroker("/ws")
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      debug: str => console.debug('[STOMP]', str)
    });

    this.client.onConnect = () => {
      this.connected$.next(true);
    };
    this.client.onStompError = frame => console.error('[STOMP error]', frame);

    // lancer la connexion immédiatement
    this.client.activate();
  }

  /** renvoie un Observable qui souscrit **après** connexion au topic public */
  watchPublic(projectId: number): Observable<ChatMessage> {
    return new Observable(sub => {
      const connSub = this.connected$.subscribe(ready => {
        if (!ready) return;
        const stompSub = this.client.subscribe(
          `/topic/pchats/${projectId}/public`,
          (msg: IMessage) => sub.next(JSON.parse(msg.body))
        );
        connSub.unsubscribe();
        return () => stompSub.unsubscribe();
      });
    });
  }

  /** envoie un message public via STOMP */
  sendPublic(projectId: number, payload: any) {
    if (!this.connected$.value) return;
    this.client.publish({
      destination: `/app/pchats/${projectId}/public`,
      body: JSON.stringify(payload)
    });
  }

 


}
