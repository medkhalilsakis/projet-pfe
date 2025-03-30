import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  id?: number;
  contenu: string;
  dateEnvoi?: Date;
  estLu?: boolean;
  sender: any;
  receiver: any;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private baseUrl = '/api/messages';

  constructor(private http: HttpClient) { }

  sendMessage(senderId: number, receiverId: number, contenu: string): Observable<Message> {
    const data = { senderId: senderId.toString(), receiverId: receiverId.toString(), contenu };
    return this.http.post<Message>(`${this.baseUrl}/send`, data);
  }

  getConversation(userId1: number, userId2: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/conversation?userId1=${userId1}&userId2=${userId2}`);
  }
}
