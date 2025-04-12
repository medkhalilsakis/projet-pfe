import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { SessionStorageService } from '../../services/session-storage.service';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client'; // ✅ default import
import { Subscription } from 'rxjs'; // ✅ default import

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatButtonModule,
    ReactiveFormsModule,  // Ensure ReactiveFormsModule is imported here
    MatCardModule
  ]
})
export class MessagesComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  users: any[] = [];
  messages: { text: string; sentBy: string; date: Date }[] = [];
  selectedUser: any = null;
  newMessage = '';
  searchQuery = '';

  private stompClient!: Client;

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private sessionStorage: SessionStorageService) {
    this.loadUsers();
  }

  ngOnInit(): void {
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();  // Use deactivate() to disconnect
      console.log('WebSocket disconnected');
    }
  }

  connectWebSocket() {
    const userId = this.sessionStorage.getUser().id;
    const socket = new SockJS('http://localhost:8080/ws');
  
    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: {
        'X-User-Id': userId,
      },
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      webSocketFactory: () => socket
    });
  
    this.stompClient.onConnect = () => {
      console.log('WebSocket connected');
    };
  
    this.stompClient.activate();
  }


  loadUsers() {
    this.http.get<any[]>('http://localhost:8080/api/users').subscribe({
      next: (users) => {
        this.users = users;
      },
      error: () => {
        this.snackBar.open('Erreur lors de chargement des utilisateurs', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadMessages(receiverId: number) {
    const currentUserId = this.sessionStorage.getUser().id;

    const senderToReceiver$ = this.http.get<any[]>(`http://localhost:8080/api/chat/history/${currentUserId}/${receiverId}`);
    const receiverToSender$ = this.http.get<any[]>(`http://localhost:8080/api/chat/history/${receiverId}/${currentUserId}`);

    forkJoin([senderToReceiver$, receiverToSender$]).subscribe({
      next: ([messagesA, messagesB]) => {
        const combined = [...messagesA, ...messagesB].map(msg => ({
          text: msg.message,
          sentBy: msg.sender.id === currentUserId ? 'me' : 'other',
          date: new Date(msg.createdAt)
        }));

        this.messages = combined.sort((a, b) => a.date.getTime() - b.date.getTime());
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des messages', 'Fermer', { duration: 3000 });
      }
    });
  }

  filteredUsers() {
    return this.users.filter(user =>
      user.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.prenom.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.loadMessages(user.id);
  
    if (!this.stompClient || !this.stompClient.connected) {
      return;
    }
  
    const userId = this.sessionStorage.getUser().id;
    const selectedUserId = user.id;
  
    // Avoid duplicate subscriptions by unsubscribing previous ones
    this.stompClient.unsubscribe('chat-sub'); // optional cleanup if you add `id` when subscribing
  
    const topic1 = `/topic/messages/${userId}/${selectedUserId}`;
    const topic2 = `/topic/messages/${selectedUserId}/${userId}`;
  
    this.stompClient.subscribe(topic1, (message: IMessage) => {
      const body = JSON.parse(message.body);
      this.messages.push({ text: body.message, sentBy: 'other', date: new Date(body.createdAt) });
      this.scrollToBottom();
    }, { id: 'chat-sub' });
  
    /*this.stompClient.subscribe(topic2, (message: IMessage) => {
      const body = JSON.parse(message.body);
      this.messages.push({ text: body.message, sentBy: 'other', date: new Date(body.createdAt) });
      this.scrollToBottom();
    }, { id: 'chat-sub' });*/
  }
  

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedUser) return;
    
    const formData = {
      message: this.newMessage,
      senderId: this.sessionStorage.getUser().id,
      receiverId: this.selectedUser.id,
      createdAt: new Date()
    };

    // REST call
    this.http.post(`http://localhost:8080/api/chat/send`, formData).subscribe({
      next: () => {
        this.messages.push({ text: this.newMessage, sentBy: 'me', date: new Date() });
        this.newMessage = '';
        this.snackBar.open('Message envoyé avec succès', 'Fermer', { duration: 3000 });

        // WebSocket push
        if (this.stompClient && this.stompClient.connected) {
          this.stompClient.publish({
            destination: `/topic/messages/${formData.receiverId}/${formData.senderId}`,
            body: JSON.stringify(formData)
          });
        }

      },
      error: () => {
        this.snackBar.open('Erreur lors de l\'envoi du message', 'Fermer', { duration: 3000 });
      }
    });
  }

  shouldShowTimestamp(index: number): boolean {
    if (index === 0) return true;
    const current = this.messages[index].date;
    const previous = this.messages[index - 1].date;
    return (current.getTime() - previous.getTime()) > 30 * 60 * 1000 - 1;
  }
}