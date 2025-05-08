// src/app/services/chat-stomp.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import SockJS from 'sockjs-client';
import { Client, over, Message } from 'stompjs';
import { Observable } from 'rxjs';

export interface ChatMessageDTO {
  id: number;
  message: string;
  createdAt: string;
  sender: { id: number; prenom: string; nom: string; };
  attachments?: { id: number; fileName: string; mimeType: string; }[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatStompService {
  private stompClient!: Client;
  private readonly API = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {
    const socket = new SockJS(`${this.API.replace('/api','')}/ws`);
    this.stompClient = over(socket);
    this.stompClient.connect(
      { 'X-User-Id': localStorage.getItem('user_id') || '' },
      () => console.log('[STOMP] connecté'),
      err => console.error('[STOMP] erreur', err)
    );
  }

  // REST : lister
  list(projectId: number): Observable<ChatMessageDTO[]> {
    return this.http.get<ChatMessageDTO[]>(
      `${this.API}/projects/${projectId}/chat`
    );
  }

  // REST : poster un message (avec pièces jointes)
  postMessage(projectId: number, form: FormData): Observable<ChatMessageDTO> {
    return this.http.post<ChatMessageDTO>(
      `${this.API}/projects/${projectId}/chat`,
      form
    );
  }

  // REST : supprimer message
  deleteMessage(projectId: number, msgId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API}/projects/${projectId}/chat/messages/${msgId}`
    );
  }

  // REST : supprimer pièce jointe
  deleteAttachment(projectId: number, attId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.API}/projects/${projectId}/chat/attachments/${attId}`
    );
  }

  // STOMP : souscrire
  subscribe(dest: string, cb: (frame: Message) => void) {
    this.stompClient.subscribe(dest, cb);
  }

  // STOMP : publier un payload JSON
  publish(destination: string, payload: any) {
    this.stompClient.send(destination, {}, JSON.stringify(payload));
  }
}
