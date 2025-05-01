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
import { PresenceService, PresenceUpdate } from '../../services/presence.service';
import { CallSignal, WebRtcService } from '../../services/webrtc.service';
import { IncomingCallDialogComponent } from './incoming-call-dialog/incoming-call-dialog.component';

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
    MatCardModule, MatSelectModule, MatDialogModule, FlexLayoutModule, IncomingCallDialogComponent
  ],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  users: any[] = [];
  selectedUser: any = null;
  messages: any[] = [];
  newMessage = '';
  selectedFiles: File[] = [];
  searchQuery = '';

  currentUserId!: number;
  currentUserAvatarUrl!: string;
  isMobile = window.innerWidth < 768;

  private stompClient!: Client;
  private msgSub?: any;
  private callSub?: Subscription;
  private subscription?: StompSubscription;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private session: SessionStorageService,
    private presenceService: PresenceService,
    private dialog: MatDialog,
    private webRtc: WebRtcService
  ) {
    const u = this.session.getUser();
    this.currentUserId = u.id;
    this.currentUserAvatarUrl = `${API}/users/${this.currentUserId}/profile-image/raw`;
    this.loadUsers();
  }

  ngOnInit() {
    this.connectWebSocket();
    this.presenceService.updatePresence(this.currentUserId, true);

    // Signaling pour WebRTC
    this.webRtc.connectSignaling(this.currentUserId);
    this.callSub = this.webRtc.incomingCallSignal$.subscribe(signal => this.promptIncomingCall(signal));
    this.webRtc.remoteStream$.subscribe(stream => {
      if (stream && this.remoteVideo) {
        this.remoteVideo.nativeElement.srcObject = stream;
      }
    });
  }
  

  ngOnDestroy() {
    this.stompClient?.deactivate();
    this.msgSub?.unsubscribe();
    this.callSub?.unsubscribe();
    this.presenceService.updatePresence(this.currentUserId, false, new Date().toISOString());
  }

  @HostListener('window:resize', ['$event'])
  onResize(e: UIEvent) {
    this.isMobile = (e.target as Window).innerWidth < 768;
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
    // *** uniquement messages ici ***
    //this.subscribeToMessages();
  };
  this.stompClient.activate();
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
  

  private loadUsers() {
    this.http.get<any[]>(`${API}/users`)
      .pipe(catchError(() => {
        this.snackBar.open('Erreur chargement users', 'Fermer', { duration: 3000 });
        return of([]);
      }))
      .subscribe(users => {
        // 1) Charger les users depuis l'API
        this.users = users
          .filter(u => u.id !== this.currentUserId)
          .map(u => ({
            ...u,
            avatarUrl: `${API}/users/${u.id}/profile-image/raw`,
            // on utilise d’abord les valeurs par défaut de l'API
            online:    u.online,
            lastSeen:  u.lastSeen
          }));
  
        // 2) Récupérer les dernières mises à jour live
        this.presenceService.presenceHistory.forEach((upd) => {
          const user = this.users.find(x => x.id === upd.userId);
          if (user) {
            user.online   = upd.online;
            user.lastSeen = upd.lastSeen ? new Date(upd.lastSeen) : undefined;
          }
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

  async startAudioCall() {
    const local = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    this.localVideo.nativeElement.srcObject = local;
    this.webRtc.initCall(local, this.selectedUser.id, this.currentUserId);
  }

  /** Bouton vidéo */
  async startVideoCall() {
    const local = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    this.localVideo.nativeElement.srcObject = local;
    this.webRtc.initCall(local, this.selectedUser.id, this.currentUserId);
  }


  private promptIncomingCall(signal: CallSignal) {
    const dialogRef = this.dialog.open(IncomingCallDialogComponent, { data: signal, panelClass: 'call-dialog' });
    dialogRef.afterClosed().subscribe(async accepted => {
      if (accepted) {
        const local = await navigator.mediaDevices.getUserMedia({ audio: true, video: signal.sdp?.includes('m=video') });
        this.localVideo.nativeElement.srcObject = local;
        this.webRtc.answerCall(local, signal, this.currentUserId);
      } else {
        this.webRtc.endCall(signal.fromUserId, this.currentUserId, 'missed');
      }
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
