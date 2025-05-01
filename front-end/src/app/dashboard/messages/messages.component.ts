import {
  Component, OnInit, OnDestroy, AfterViewChecked,
  ViewChild, ElementRef, HostListener
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionStorageService } from '../../services/session-storage.service';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactDetailsDialogComponent } from './contact-details-dialog/contact-details-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { FlexLayoutModule } from '@angular/flex-layout';

const API = 'http://localhost:8080/api';

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
  imports: [
    CommonModule, FormsModule, MatListModule, MatIconModule,
    MatButtonModule, MatInputModule, MatFormFieldModule,
    MatCardModule, MatSelectModule, MatDialogModule, FlexLayoutModule
  ],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;

  users: any[] = [];
  selectedUser: any = null;
  messages: DisplayMessage[] = [];

  newMessage = '';
  selectedFiles: File[] = [];
  searchQuery = '';

  currentUserId!: number;
  currentUserAvatarUrl!: string;

  private stompClient!: Client;
  isMobile = window.innerWidth < 768;
  private subscription: any;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private session: SessionStorageService,
    private dialog: MatDialog
  ) {
    const u = this.session.getUser();
    this.currentUserId = u.id;
    // Toujours point vers le raw endpoint : renvoie avatar perso ou fallback par défaut
    this.currentUserAvatarUrl = `${API}/users/${this.currentUserId}/profile-image/raw`;
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
    const socket = new SockJS(`${API.replace('/api','')}/ws`);
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: { 'X-User-Id': `${this.currentUserId}` }
    });
    this.stompClient.onConnect = () => console.log('WS connected');
    this.stompClient.activate();
  }

  private loadUsers() {
    this.http.get<any[]>(`${API}/users`)
      .pipe(catchError(() => {
        this.snackBar.open('Erreur chargement users', 'Fermer', { duration: 3000 });
        return of([]);
      }))
      .subscribe(users => {
        this.users = users
          .filter(u => u.id !== this.currentUserId)
          .map(u => ({
            ...u,
            // on pointe TOUJOURS vers /profile-image/raw : backend servira par défaut si besoin
            avatarUrl: `${API}/users/${u.id}/profile-image/raw`,
            online: u.online,        // présumé fourni par votre API users
            lastSeen: u.lastSeen     // idem
          }));
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
    if (this.isMobile) window.scrollTo(0, 0);
    this.loadMessages(u.id);

    // se (re)subscribe au topic
    this.subscription?.unsubscribe();
    const topic = `/topic/messages/${this.currentUserId}/${u.id}`;
    this.subscription = this.stompClient.subscribe(topic, (msg: IMessage) => {
      const body: any = JSON.parse(msg.body);
      const sentBy: SentBy =
        body.sender.id === this.currentUserId ? 'me' : 'other';
      this.appendMessage({
        text:       body.message,
        sentBy,
        date:       new Date(body.createdAt),
        avatarUrl:  sentBy === 'me'
                     ? this.currentUserAvatarUrl
                     : this.selectedUser.avatarUrl,
        attachments: body.attachments
      });
    });
  }

  private loadMessages(receiverId: number) {
    const me = this.currentUserId;
    forkJoin([
      this.http.get<ChatMessage[]>(`${API}/chat/history/${me}/${receiverId}`),
      this.http.get<ChatMessage[]>(`${API}/chat/history/${receiverId}/${me}`)
    ]).subscribe({
      next: ([out, inc]) => {
        const mapped = [
          ...out.map(m => this.toDisplay(m, 'me')),
          ...inc.map(m => this.toDisplay(m, 'other'))
        ].sort((a,b) => a.date.getTime() - b.date.getTime());
        this.messages = mapped;
      },
      error: () => this.snackBar.open('Erreur chargement messages','Fermer',{duration:3000})
    });
  }

  private toDisplay(m: ChatMessage, who: SentBy): DisplayMessage {
    return {
      text: m.message,
      sentBy: who,
      date: new Date(m.createdAt),
      avatarUrl: who==='me'
                   ? this.currentUserAvatarUrl
                   : this.selectedUser.avatarUrl,
      attachments: m.attachments
    };
  }

  private appendMessage(dm: DisplayMessage) {
    this.messages.push(dm);
    this.scrollToBottom();
  }

  onAttachmentChange(evt: Event) {
    const inp = evt.target as HTMLInputElement;
    this.selectedFiles = inp.files ? Array.from(inp.files) : [];
  }

  sendMessage() {
    if (!this.newMessage.trim() && this.selectedFiles.length===0) return;
    const me = this.currentUserId, to = this.selectedUser.id;
    const payload = {
      sender: { id: me },
      receiver: { id: to },
      message: this.newMessage,
      createdAt: new Date().toISOString()
    };
    const fd = new FormData();
    fd.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    this.selectedFiles.forEach(f => fd.append('attachments', f, f.name));
    this.http.post<ChatMessage>(`${API}/chat/send`, fd).subscribe({
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
    // **Garde-fou** : si le conteneur n’existe pas, on ne fait rien
    if (!this.scrollContainer?.nativeElement) {
      return;
    }
    const el = this.scrollContainer.nativeElement as HTMLElement;
    el.scrollTop = el.scrollHeight;
  }

  ngAfterViewChecked() { this.scrollToBottom(); }

  openContactDetails() {
    this.dialog.open(ContactDetailsDialogComponent, {
      width: '320px',
      data: this.selectedUser
    });
  }
  
}
