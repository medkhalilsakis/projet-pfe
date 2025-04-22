import { Component, Inject, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { SessionStorageService } from '../../../services/session-storage.service';
import { ChatStompService } from '../../../services/chat-stomp.service';

export interface ChatMessage {
  id: number;
  message: string;
  createdAt: string;
  sender: { id: number; prenom: string; nom: string; };
  messageType: string; // "PUBLIC" ou "PRIVATE"
}

@Component({
  selector: 'app-project-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>Chat du projet</h2>

    <mat-dialog-content class="chat-content" #scrollMe>
      <nav class="chat-tabs">
        <button mat-button 
                [class.active]="activeTab==='public'" 
                (click)="switchTab('public')">
          Chat Public
        </button>
        <button mat-button 
                [class.active]="activeTab==='private'" 
                (click)="switchTab('private')">
          Commentaires Privés
        </button>
      </nav>

      <div *ngIf="activeTab==='public'" class="messages-container">
        <div *ngFor="let msg of publicMessages"
             class="bubble"
             [class.mine]="msg.sender.id === userId"
             [class.theirs]="msg.sender.id !== userId">
          <div class="message-header">
            <span class="sender">{{msg.sender.prenom}} {{msg.sender.nom}}</span>
            <span class="timestamp">{{msg.createdAt | date:'shortTime'}}</span>
          </div>
          <div class="message-body">{{msg.message}}</div>
        </div>
      </div>

      <div *ngIf="activeTab==='private'" class="messages-container">
        <ng-container *ngIf="isUploader; else noAccess">
          <div *ngFor="let msg of privateMessages"
               class="bubble"
               [class.mine]="msg.sender.id === userId"
               [class.theirs]="msg.sender.id !== userId">
            <div class="message-header">
              <span class="sender">{{msg.sender.prenom}} {{msg.sender.nom}}</span>
              <span class="timestamp">{{msg.createdAt | date:'shortTime'}}</span>
            </div>
            <div class="message-body">{{msg.message}}</div>
          </div>
        </ng-container>
        <ng-template #noAccess>
          <div class="not-allowed">
            Vous n'êtes pas autorisé à consulter les commentaires privés.
          </div>
        </ng-template>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="chat-actions">
      <textarea matInput
                placeholder="Votre message..."
                [(ngModel)]="newMessage"
                (keyup.enter)="sendMessage()">
      </textarea>
      <button mat-icon-button color="primary" (click)="sendMessage()">
        <mat-icon>send</mat-icon>
      </button>
      <button mat-button (click)="close()">Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .chat-content {
      max-height: 400px;
      overflow-y: auto;
      padding: 8px;
      background: #fafafa;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
    .chat-tabs {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      border-bottom: 1px solid #ddd;
    }
    .chat-tabs button.active {
      color: #3f51b5;
      border-bottom: 2px solid #3f51b5;
    }
    .messages-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 8px;
    }
    .bubble {
      max-width: 70%;
      padding: 12px;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      white-space: pre-wrap;
      word-break: break-word;
    }
    .mine { align-self: flex-end; background: #dcf8c6; }
    .theirs { align-self: flex-start; background: #fff; }
    .message-header {
      font-size: .8em;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      color: #555;
    }
    .sender { font-weight: 600; }
    .timestamp { font-style: italic; color: #999; }
    .message-body { font-size: 1em; color: #333; }
    .chat-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }
    textarea[matInput] {
      flex: 1;
      resize: none;
      padding: 8px;
      font-family: inherit;
    }
    .not-allowed {
      text-align: center;
      padding: 20px;
      color: #999;
      font-style: italic;
    }
  `]
})
export class ProjectChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('scrollMe') private scrollContainer!: ElementRef;

  publicMessages: ChatMessage[] = [];
  privateMessages: ChatMessage[] = [];
  newMessage = '';
  activeTab: 'public' | 'private' = 'public';
  isUploader = false;
  projectId!: number;
  userId!: number;

  private subs = new Subscription();

  constructor(
    private http: HttpClient,
    private chatStomp: ChatStompService,
    private snackBar: MatSnackBar,
    private sessionStorage: SessionStorageService,
    public dialogRef: MatDialogRef<ProjectChatComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number; uploaderId: number }
  ) {
    this.projectId = data.projectId;
  }

  ngOnInit(): void {
    const user = this.sessionStorage.getUser();
    if (!user?.id) {
      this.snackBar.open('Utilisateur non identifié.', 'Fermer', { duration: 3000 });
      return this.dialogRef.close();
    }
    this.userId    = user.id;
    this.isUploader = this.userId === this.data.uploaderId;

    // 1) Charger l’historique HTTP
    this.loadPublicMessages();
    if (this.isUploader) { this.loadPrivateMessages(); }

    // 2) S’abonner au flux temps réel
    this.subs.add(
      this.chatStomp.watchPublic(this.projectId)
        .subscribe(msg => { this.publicMessages.push(msg); this.scrollToBottom(); })
    );
    if (this.isUploader) {
      this.subs.add(
        this.chatStomp.watchPrivate(this.projectId)
          .subscribe(msg => { this.privateMessages.push(msg); this.scrollToBottom(); })
      );
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  switchTab(tab: 'public'|'private'): void {
    this.activeTab = tab;
    if (tab === 'private' && this.isUploader) {
      this.loadPrivateMessages();
    }
  }

  private loadPublicMessages(): void {
    this.http.get<ChatMessage[]>(`http://localhost:8080/api/pchats/${this.projectId}/public`)
      .subscribe(msgs => { this.publicMessages = msgs; this.scrollToBottom(); },
                 _    => this.snackBar.open('Erreur chargement chat public','Fermer',{duration:3000}));
  }

  private loadPrivateMessages(): void {
    this.http.get<ChatMessage[]>(`http://localhost:8080/api/pchats/${this.projectId}/private?requesterId=${this.userId}`)
      .subscribe(msgs => { this.privateMessages = msgs; this.scrollToBottom(); },
                 _    => this.snackBar.open('Erreur chat privé','Fermer',{duration:3000}));
  }

  sendMessage(): void {
    const text = this.newMessage.trim();
    if (!text) return;
    const payload = { senderId: this.userId.toString(), message: text };

    if (this.activeTab === 'public') {
      this.chatStomp.sendPublic(this.projectId, payload);
    } else {
      this.chatStomp.sendPrivate(this.projectId, payload);
    }
    this.newMessage = '';
  }

  close(): void {
    this.dialogRef.close();
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
