import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  id: number;
  project: any;
  sender: { id: number; name: string };
  message: string;
  createdAt: string;
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

  sendMessage(projectId: number, senderId: number, message: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.baseUrl}/${projectId}/chat`, { senderId, message });
  }
}
