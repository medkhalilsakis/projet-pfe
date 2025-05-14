import {
  Component, OnInit, OnDestroy, AfterViewChecked,
  ViewChild, ElementRef, HostListener
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionStorageService } from '../../services/session-storage.service';
import SockJS from 'sockjs-client';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { forkJoin, of, Subscription } from 'rxjs';
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
import { PresenceService } from '../../services/presence.service';
import { MediaViewerComponent } from './media-viewer/media-viewer.component';

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
onDeleteMessage(_t68: any) {
throw new Error('Method not implemented.');
}
  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;

  users: any[] = [];
  sortedUsers: any[] = [];

  mediaViewerOpen = false;
  mediaUrl: string = '';
  mediaType: string = '';

  selectedUser: any = null;
  selectedFiles: File[] = [];

  messages: any[] = [];
  newMessage = '';
  searchQuery = '';

  currentUserId!: number;
  currentUserAvatarUrl!: string;
  isMobile = window.innerWidth < 768;

  private stompClient!: Client;
  private msgSub?: any;
  private subscription?: StompSubscription;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private session: SessionStorageService,
    private presenceService: PresenceService,
    private dialog: MatDialog,
  ) {
    const u = this.session.getUser();
    this.currentUserId = u.id;
    this.currentUserAvatarUrl = `${API}/users/${this.currentUserId}/profile-image/raw`;
    this.loadUsers();
  }

  ngOnInit() {
    this.connectWebSocket();
    this.presenceService.updatePresence(this.currentUserId, true);
  }
  

  ngOnDestroy() {
    this.stompClient?.deactivate();
    this.msgSub?.unsubscribe();
    this.presenceService.updatePresence(this.currentUserId, false, new Date().toISOString());
  }

  @HostListener('window:resize', ['$event'])
  onResize(e: UIEvent) {
    this.isMobile = (e.target as Window).innerWidth < 768;
  }

  



  getStatus(u: { online: boolean; lastSeen?: Date }): string {
    if (u.online) {
      return 'Connecté';
    }
    if (!u.lastSeen) {
      return 'Hors ligne';
    }
  
    const now = Date.now();
    const last = new Date(u.lastSeen).getTime();
    const diffMs = now - last;
    const diffH = diffMs / (1000 * 60 * 60);
  
    if (diffH < 24) {
      if (diffH < 1) {
        const diffMin = Math.floor(diffMs / (1000 * 60));
        return `En ligne il y a ${diffMin} min`;
      }
      const h = Math.floor(diffH);
      const m = Math.floor((diffH - h) * 60);
      return m > 0
        ? `En ligne il y a ${h} h ${m} min`
        : `En ligne il y a ${h} h`;
    }
  
    return 'Hors ligne';
  }
  

  private connectWebSocket() {
    const socket = new SockJS(`${API.replace('/api','')}/ws`);
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: { 'X-User-Id': `${this.currentUserId}` }
    });
    
    this.stompClient.onConnect = () => {
      console.log("connecté");
      // Connexion établie, aucun message n'est encore reçu.
    };
    
    this.stompClient.activate();
  }
  
  selectUser(u: any) {
    this.selectedUser = u;
    if (this.isMobile) window.scrollTo(0, 0);
    this.loadMessages(u.id);
    
    // Se (re)abonner au topic de l'utilisateur sélectionné
    this.subscribeToMessages(u.id);
  }
  
  private subscribeToMessages(receiverId: number) {
    const topic = `/topic/messages/${this.currentUserId}/${receiverId}`;
    this.subscription = this.stompClient.subscribe(topic, (msg: IMessage) => {
      const body: any = JSON.parse(msg.body);
      const sentBy: SentBy = body.sender.id === this.currentUserId ? 'me' : 'other';
      this.appendMessage({
        text: body.message,
        sentBy,
        date: new Date(body.createdAt),
        avatarUrl: sentBy === 'me'
          ? this.currentUserAvatarUrl
          : this.selectedUser.avatarUrl,
        attachments: body.attachments
      });
    });
  }
  
  private loadUsers() {
    this.http.get<any[]>(`${API}/users`)
      .pipe(catchError(() => {
        this.snackBar.open('Erreur chargement users', 'Fermer', { duration: 3000 });
        return of([]);
      }))
      .subscribe(users => {
        // Charger les utilisateurs depuis l'API
        this.users = users
          .filter(u => u.id !== this.currentUserId)
          .map(u => ({
            ...u,
            avatarUrl: `${API}/users/${u.id}/profile-image/raw`,
            online:    u.online,
            lastSeen:  u.lastSeen
          }));
  
        // Récupérer les dernières conversations
        this.loadMessagesForAllUsers().then(() => {
          // Trier les utilisateurs selon la date du dernier message échangé
          this.sortedUsers = this.users.sort((a, b) => {
            const lastMessageA = a.lastMessageDate ? new Date(a.lastMessageDate).getTime() : 0;
            const lastMessageB = b.lastMessageDate ? new Date(b.lastMessageDate).getTime() : 0;
            return lastMessageB - lastMessageA;
          });
        });
      });
  }

  private loadMessagesForAllUsers() {
    const me = this.currentUserId;
    // Créer un tableau de promises pour récupérer les derniers messages
    const messagePromises = this.users.map(user => {
      return this.loadLastMessageForUser(me, user.id);
    });
  
    // Attendre que toutes les promesses se terminent
    return Promise.all(messagePromises);
  }
  
  private loadLastMessageForUser(senderId: number, receiverId: number) {
    return this.http.get<ChatMessage[]>(`${API}/chat/history/${senderId}/${receiverId}`)
      .pipe(catchError(() => of([])))  // Si une erreur survient, on retourne un tableau vide.
      .toPromise()
      .then(messages => {
        // Vérifie que "messages" n'est ni "undefined" ni vide
        if (messages && messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          const user = this.users.find(u => u.id === receiverId);
          if (user) {
            user.lastMessageDate = lastMessage.createdAt;  // Stocker la date du dernier message
          }
        }
      });
  }
  
  

  filteredUsers() {
    const q = this.searchQuery.toLowerCase().trim();
    return this.users.filter(u =>
      u.prenom.toLowerCase().includes(q) ||
      u.nom.toLowerCase().includes(q)
    );
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
    const input = evt.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  removeAttachment(file: File) {
    const index = this.selectedFiles.indexOf(file);
    if (index > -1) {
      this.selectedFiles.splice(index, 1);
    }
  }

  sendMessage() {
    if (!this.newMessage.trim() && this.selectedFiles.length === 0) return;
    
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
      next: (m) => {
        this.appendMessage(this.toDisplay(m, 'me'));
        this.newMessage = '';
        this.selectedFiles = [];
      },
      error: () => this.snackBar.open('Erreur envoi', 'Fermer', { duration: 2000 })
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


  openMediaViewer(filePath: string, mimeType: string): void {
    this.dialog.open(MediaViewerComponent, {
      data: { filePath, mimeType },
      width: '80vw',
      height: '80vh',
      panelClass: 'media-dialog'
    });
  }
  
}

