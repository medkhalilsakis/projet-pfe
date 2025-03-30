import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable, interval, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { SessionStorageService } from '../../services/session-storage.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';

interface Conversation {
  id: number;
  // Ces propriétés peuvent être ajustées en fonction de la réponse du backend.
  user1Id: number;
  user2Id: number;
  lastMessage?: string;
  updatedAt: string;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatListModule
  ]
})
export class MessagesComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  searchQuery: string = '';
  newMessage: string = '';
  users: any[] = [];
  user: any;

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private sessionService: SessionStorageService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.user = this.sessionService.getUser();
    if (this.user && this.user.id) {
      this.loadConversations();
      // Polling toutes les 3 secondes pour actualiser les messages
      interval(3000)
        .pipe(
          takeUntil(this.destroy$),
          switchMap(() => this.getMessages(this.selectedConversation?.id))
        )
        .subscribe(messages => {
          if (this.selectedConversation) {
            this.messages = messages;
            this.markConversationAsRead(this.selectedConversation.id);
          }
        });
    }
  }

  loadConversations(): void {
    this.http.get<Conversation[]>(`http://localhost:8080/api/chats?userId=${this.user.id}`)
      .subscribe({
        next: (data) => this.conversations = data,
        error: (err) => this.snackBar.open('Erreur lors du chargement des conversations', 'Fermer', { duration: 5000 })
      });
  }

  getMessages(conversationId?: number): Observable<Message[]> {
    if (!conversationId) {
      return new Observable<Message[]>(subscriber => subscriber.next([]));
    }
    return this.http.get<Message[]>(`http://localhost:8080/api/chats/${conversationId}/messages`);
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.getMessages(conversation.id).subscribe(messages => {
      this.messages = messages;
      this.markConversationAsRead(conversation.id);
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation) return;
    const payload = {
      conversationId: this.selectedConversation.id.toString(),
      senderId: this.user.id.toString(),
      content: this.newMessage.trim()
    };
    // Envoi via REST pour simplifier (vous pouvez basculer sur WebSocket)
    this.http.post(`http://localhost:8080/api/chats/sendMessage`, payload).subscribe(() => {
      this.newMessage = '';
      this.getMessages(this.selectedConversation!.id).subscribe(msgs => this.messages = msgs);
    }, err => {
      this.snackBar.open('Erreur lors de l\'envoi du message', 'Fermer', { duration: 5000 });
    });
  }

  markConversationAsRead(conversationId: number): void {
    this.http.post(`http://localhost:8080/api/chats/${conversationId}/markAsRead?userId=${this.user.id}`, {}, { responseType: 'text' })
      .subscribe();
  }
  

  searchUsers(): void {
    if (!this.searchQuery.trim()) {
      this.snackBar.open('Veuillez entrer un terme de recherche', 'Fermer', { duration: 3000 });
      return;
    }
    this.http.get<any[]>(`http://localhost:8080/api/users/search?query=${this.searchQuery}`)
      .subscribe(
        (data) => {
          this.users = data;
          if (data.length === 0) {
            this.snackBar.open('Aucun utilisateur trouvé', 'Fermer', { duration: 3000 });
          }
        },
        (error) => {
          this.snackBar.open('Erreur lors de la recherche', 'Fermer', { duration: 3000 });
          console.error('Erreur:', error);
        }
      );
  }

  startConversation(user: any): void {
    if (!this.user || !user) return;
    const payload = {
      user1Id: this.user.id,
      user2Id: user.id
    };
    this.http.post<Conversation>(`http://localhost:8080/api/chats/startConversation`, payload)
      .subscribe({
        next: (conv) => {
          // Ajoute la conversation à la liste et la sélectionne
          this.conversations.push(conv);
          this.selectConversation(conv);
          // Réinitialise la recherche
          this.users = [];
          this.searchQuery = '';
        },
        error: (err) => {
          this.snackBar.open('Erreur lors de la création de la conversation', 'Fermer', { duration: 5000 });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
