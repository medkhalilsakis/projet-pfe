import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionStorageService } from '../../services/session-storage.service';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSelectModule
  ],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  users: any[] = [];
  selectedUser: any = null;
  messages: { text: string; sentBy: 'me'|'other'; date: Date }[] = [];
  newMessage = '';
  searchQuery = '';
  currentUserId!: number;
  stompClient!: Client;
  isMobile = window.innerWidth < 768;
  private subscription: any;  // Track the current subscription

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private session: SessionStorageService
  ) {
    const u = this.session.getUser();
    this.currentUserId = u?.id;
    this.loadUsers();
  }

  @HostListener('window:resize', ['$event'])
  onResize(e: UIEvent) {
    this.isMobile = (e.target as Window).innerWidth < 768;
  }

  ngOnInit() {
    this.connectWebSocket();
  }

  ngOnDestroy() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private connectWebSocket() {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: { 'X-User-Id': this.currentUserId.toString(), }
    });
    this.stompClient.onConnect = () => console.log('WS connected');
    this.stompClient.activate();
  }

  private loadUsers() {
    this.http.get<any[]>('http://localhost:8080/api/users')
      .pipe(
        catchError(err => {
          this.snackBar.open('Erreur chargement users', 'Fermer', { duration: 3000 });
          return of([]); // on continue avec une liste vide
        })
      )
      .subscribe(users => {
        this.users = users
          .filter(u => u.id !== this.currentUserId)
          .map(u => ({
            ...u,
            // par défaut, on utilise l’image ImgURl
            avatarUrl: 'https://i.imgur.com/vtrfxgY.png',
            initials: `${u.prenom[0]}${u.nom[0]}`.toUpperCase()
          }));
  
        // pour chacun, on tente de récupérer le meta
        this.users.forEach(u => {
          const metaUrl = `http://localhost:8080/api/users/${u.id}/profile-image/meta`;
          this.http.get(metaUrl, { observe: 'response' })
            .pipe(
              catchError(err => {
                // si 404 on ne fait rien, sinon on peut logger
                if (err.status !== 404) {
                  console.error(`Erreur inattendue pour avatar meta user ${u.id}`, err);
                  this.snackBar.open(`Erreur chargement avatar de ${u.prenom}`, 'Fermer', { duration: 3000 });
                }
                return of(null);
              })
            )
            .subscribe(resp => {
              if (resp && resp.status === 200) {
                u.avatarUrl = `http://localhost:8080/api/users/${u.id}/profile-image/raw`;
              }
            });
        });
      });
  }
  

  filteredUsers() {
    const q = this.searchQuery.toLowerCase().trim();
    return this.users.filter(u =>
      u.prenom.toLowerCase().includes(q) ||
      u.nom.toLowerCase().includes(q)
    );
  }

  selectUser(u: any) {
    this.selectedUser = u;
    if (!this.selectedUser) {
      this.snackBar.open('Utilisateur non sélectionné.', 'Fermer', { duration: 3000 });
      return;
    }
    if (this.isMobile) window.scrollTo(0, 0);
    this.loadMessages(u.id);
  
    // Assurez-vous que le WebSocket fonctionne correctement
    if (!this.stompClient || !this.stompClient.connected) {
      return;
    }
  
    // Désabonnement précédent s'il existe
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  
    // Souscription au topic du nouvel utilisateur sélectionné
    const topic = `/topic/messages/${this.currentUserId}/${u.id}`;
    this.subscription = this.stompClient.subscribe(topic, (message: IMessage) => {
      const body = JSON.parse(message.body);
      
      // Vérification si senderId est présent (utilisation de senderId au lieu de sender)
      if (!body.senderId) {
        console.error('Erreur : senderId manquant', body);
        return;
      }
    
      // Utilisez senderId pour déterminer si c'est l'utilisateur actuel ou un autre utilisateur
      const sentBy: 'me' | 'other' = body.senderId === this.currentUserId ? 'me' : 'other';
    
      this.messages.push({
        text: body.message,
        sentBy,
        date: new Date(body.createdAt)
      });
    
      this.scrollToBottom();
    });
    
  }
  

  deselectUser() {
    this.selectedUser = null;
  }

  private loadMessages(receiverId: number) {
    const me = this.currentUserId;
    const a$ = this.http.get<any[]>(`http://localhost:8080/api/chat/history/${me}/${receiverId}`);
    const b$ = this.http.get<any[]>(`http://localhost:8080/api/chat/history/${receiverId}/${me}`);
    forkJoin([a$, b$]).subscribe({
      next: ([as, bs]) => {
        this.messages = [...as, ...bs]
          .map(m => {
            const sentBy: 'me' | 'other' = (m.sender.id === me ? 'me' : 'other');
            return {
              text: String(m.message),
              sentBy,
              date: new Date(m.createdAt)
            };
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime());
      },
      error: () => this.snackBar.open('Erreur chargement messages', 'Fermer', { duration: 3000 })
    });
  }
  

  sendMessage() {
    if(!this.newMessage.trim() || !this.selectedUser) return;
    const me = this.currentUserId;
    const to = this.selectedUser.id;
    const payload = {
      message: this.newMessage,
      senderId: me,
      receiverId: to,
      createdAt: new Date().toISOString()
    };

    this.http.post('http://localhost:8080/api/chat/send', payload).subscribe({
      next: () => {
        this.messages.push({ text: this.newMessage, sentBy: 'me', date: new Date() });
        this.stompClient.publish({
          destination: `/topic/messages/${to}/${me}`,
          body: JSON.stringify(payload)
        });
        this.newMessage = '';
      },
      error: () => this.snackBar.open('Erreur envoi', 'Fermer', { duration: 3000 })
    });
  }

  scrollToBottom(): void {
    try {
      if (this.scrollContainer && this.scrollContainer.nativeElement) {
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    } catch (err) {
      console.error('Erreur lors du défilement automatique', err);
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }
}
