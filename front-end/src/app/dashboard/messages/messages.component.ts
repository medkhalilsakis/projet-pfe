// messages.component.ts
import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionStorageService } from '../../services/session-storage.service';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';

interface ChatMessage {
  id: number;
  sender: { id: number; prenom: string; nom: string; };
  receiver: any;
  message: string;
  createdAt: string;
  attachments?: { fileName: string; filePath: string; mimeType: string; }[];
}

type SentBy = 'me' | 'other';

interface DisplayMessage {
  text:       string;
  sentBy:     SentBy;
  date:       Date;
  avatarUrl:  string;
  attachments?: { fileName: string; filePath: string; mimeType: string; }[];
}

@Component({
  selector: 'app-messages',
  standalone: true,
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
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
})
export class MessagesComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  users: any[] = [];
  selectedUser: any = null;
  messages: DisplayMessage[] = [];

  newMessage = '';
  selectedFiles: File[] = [];
  searchQuery = '';

  currentUserId!: number;
  currentUserAvatar = '';

  stompClient!: Client;
  isMobile = window.innerWidth < 768;
  private subscription: any;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private session: SessionStorageService
  ) {
    const u = this.session.getUser();
    this.currentUserId     = u?.id;
    this.currentUserAvatar = u?.profileImageUrl || 'https://i.imgur.com/vtrfxgY.png';
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
    this.stompClient?.deactivate();
    this.subscription?.unsubscribe();
  }

  private connectWebSocket() {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: { 'X-User-Id': `${this.currentUserId}` }
    });
    this.stompClient.onConnect = () => console.log('WS connected');
    this.stompClient.activate();
  }

  private loadUsers() {
    this.http.get<any[]>('http://localhost:8080/api/users')
      .pipe(catchError(() => {
        this.snackBar.open('Erreur chargement users', 'Fermer', { duration: 3000 });
        return of([]);
      }))
      .subscribe(users => {
        this.users = users.filter(u => u.id !== this.currentUserId)
                          .map(u => ({
                            ...u,
                            avatarUrl: 'https://i.imgur.com/vtrfxgY.png'
                          }));
        // Charger avatar réel…
        this.users.forEach(u => {
          this.http.get(`http://localhost:8080/api/users/${u.id}/profile-image/meta`, { observe: 'response' })
            .pipe(catchError(() => of(null)))
            .subscribe(resp => {
              if (resp?.status === 200) {
                u.avatarUrl = `http://localhost:8080/api/users/${u.id}/profile-image/raw`;
              }
            });
        });
      });
  }

  filteredUsers() {
    const q = this.searchQuery.toLowerCase().trim();
    return this.users.filter(u =>
      u.prenom.toLowerCase().includes(q) || u.nom.toLowerCase().includes(q)
    );
  }

  selectUser(u: any) {
    this.selectedUser = u;
    if (this.isMobile) window.scrollTo(0, 0);
    this.loadMessages(u.id);
    this.subscription?.unsubscribe();
    const topic = `/topic/messages/${this.currentUserId}/${u.id}`;
    this.subscription = this.stompClient.subscribe(topic, (msg: IMessage) => {
      const body: any = JSON.parse(msg.body);
      const sentBy = body.senderId === this.currentUserId ? 'me' : 'other';
      this.appendMessage({
        text:       body.message,
        sentBy,
        date:       new Date(body.createdAt),
        avatarUrl:  sentBy === 'me' ? this.currentUserAvatar : this.selectedUser.avatarUrl,
        attachments: body.attachments
      });
    });
  }

  private loadMessages(receiverId: number) {
    const me = this.currentUserId;
    forkJoin([
      this.http.get<ChatMessage[]>(`http://localhost:8080/api/chat/history/${me}/${receiverId}`),
      this.http.get<ChatMessage[]>(`http://localhost:8080/api/chat/history/${receiverId}/${me}`)
    ]).subscribe({
      next: ([out, inb]) => {
        const mappedOut = out.map(m => this.toDisplay(m, 'me'));
        const mappedInb= inb.map(m => this.toDisplay(m, 'other'));
        this.messages = [...mappedOut, ...mappedInb]
          .sort((a,b) => a.date.getTime() - b.date.getTime());
      },
      error: () => this.snackBar.open('Erreur chargement messages','Fermer',{duration:3000})
    });
  }

  private toDisplay(m: ChatMessage, who: SentBy): DisplayMessage {
    return {
      text: m.message,
      sentBy: who,
      date: new Date(m.createdAt),
      avatarUrl: who === 'me' ? this.currentUserAvatar : this.selectedUser.avatarUrl!,
      attachments: m.attachments
    };
  }

  /** Ajoute un message à l’affichage et scroll en bas */
  private appendMessage(dm: DisplayMessage) {
    this.messages.push(dm);
    this.scrollToBottom();
  }

  onAttachmentChange(evt: Event) {
    const inp = evt.target as HTMLInputElement;
    this.selectedFiles = inp.files ? Array.from(inp.files) : [];
  }

  sendMessage() {
    if (!this.newMessage.trim() && this.selectedFiles.length === 0) return;
    const me = this.currentUserId, to = this.selectedUser.id;
    const payload = {
      sender:   { id: me },
      receiver: { id: to },
      message:  this.newMessage,
      createdAt: new Date().toISOString()
    };
    const fd = new FormData();
    fd.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    this.selectedFiles.forEach(f => fd.append('attachments', f, f.name));

    this.http.post<ChatMessage>('http://localhost:8080/api/chat/send', fd).subscribe({
      next: m => {
        this.appendMessage(this.toDisplay(m, 'me'));
        this.newMessage = '';
        this.selectedFiles = [];
      },
      error: () => this.snackBar.open('Erreur envoi','Fermer',{duration:2000})
    });
  }

  deselectUser() { this.selectedUser = null; }

  private scrollToBottom() {
    setTimeout(() => {
      try {
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      } catch {}
    });
  }

  ngAfterViewChecked() { this.scrollToBottom(); }
}
