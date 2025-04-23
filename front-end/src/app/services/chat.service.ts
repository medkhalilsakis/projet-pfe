import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  id: number;
  project: any;
  sender: { id: number; name: string };
  receiver: { id: number; name: string };
  message: string;
  createdAt: string;
  sentBy: 'me' | 'other';  // Indiquer si c'est l'utilisateur actuel ou un autre utilisateur
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = 'http://localhost:8080/api/chats';

  constructor(private http: HttpClient) {}

  getMessages(projectId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/${projectId}/chat`);
  }

  sendMessage(projectId: number, senderId: number, receiverId: number, message: string): Observable<ChatMessage> {
    const payload = {
      senderId,
      receiverId,
      message,
      createdAt: new Date().toISOString()  // Ajouter la date si nécessaire
    };
    return this.http.post<ChatMessage>(`${this.baseUrl}/${projectId}/chat`, payload);
  }
}
