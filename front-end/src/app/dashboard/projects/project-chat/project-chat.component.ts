import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SessionStorageService } from '../../../services/session-storage.service';

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
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    FormsModule
  ],
  template: `
  <h2 mat-dialog-title>Chat du projet</h2>
  <mat-dialog-content class="chat-content">
    <nav class="chat-tabs">
      <button mat-button 
              [ngClass]="{'active': activeTab === 'public'}" 
              (click)="switchTab('public')">
        Chat Public
      </button>
      <button mat-button 
              [ngClass]="{'active': activeTab === 'private'}" 
              (click)="switchTab('private')">
        Commentaires Privés
      </button>
    </nav>
    
    <div *ngIf="activeTab === 'public'" class="messages-container">
      <div *ngFor="let msg of publicMessages" 
           [ngClass]="{'bubble': true, 'mine': msg.sender.id === userId, 'theirs': msg.sender.id !== userId}">
        <div class="message-header">
          <span class="sender">{{ msg.sender.prenom }} {{ msg.sender.nom }}</span>
          <span class="timestamp">{{ msg.createdAt | date:'shortTime' }}</span>
        </div>
        <div class="message-body">{{ msg.message }}</div>
      </div>
    </div>
    
    <div *ngIf="activeTab === 'private'" class="messages-container">
      <!-- Si l'utilisateur n'est pas uploader, on n'affiche rien -->
      <ng-container *ngIf="isUploader; else noAccess">
        <div *ngFor="let msg of privateMessages" 
             [ngClass]="{'bubble': true, 'mine': msg.sender.id === userId, 'theirs': msg.sender.id !== userId}">
          <div class="message-header">
            <span class="sender">{{ msg.sender.prenom }} {{ msg.sender.nom }}</span>
            <span class="timestamp">{{ msg.createdAt | date:'shortTime' }}</span>
          </div>
          <div class="message-body">{{ msg.message }}</div>
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
    <textarea matInput placeholder="Votre message..." [(ngModel)]="newMessage" (keyup.enter)="sendMessage()"></textarea>
    <button mat-icon-button color="primary" (click)="sendMessage()">
      <mat-icon>send</mat-icon>
    </button>
    <button mat-button (click)="close()">Fermer</button>
  </mat-dialog-actions>
  `,
  styles: [`
    /* Conteneur principal du chat */
    .chat-content {
      max-height: 400px;
      overflow-y: auto;
      padding: 8px;
      background-color: #fafafa;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
    /* Onglets */
    .chat-tabs {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      border-bottom: 1px solid #ddd;
    }
    .chat-tabs button {
      text-transform: none;
    }
    .chat-tabs button.active {
      color: #3f51b5;
      border-bottom: 2px solid #3f51b5;
    }
    /* Zone des messages */
    .messages-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 8px;
    }
    /* Bulles de messages */
    .bubble {
      max-width: 70%;
      padding: 12px;
      border-radius: 16px;
      box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
      white-space: pre-wrap;
      word-break: break-word;
    }
    .bubble.mine {
      align-self: flex-end;
      background-color: #dcf8c6;
    }
    .bubble.theirs {
      align-self: flex-start;
      background-color: #ffffff;
    }
    .message-header {
      font-size: 0.8em;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      color: #555;
    }
    .sender { font-weight: 600; }
    .timestamp { font-style: italic; color: #999; }
    .message-body { font-size: 1em; color: #333; }
    /* Actions du chat */
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
export class ProjectChatComponent implements OnInit {

  publicMessages: ChatMessage[] = [];
  privateMessages: ChatMessage[] = [];
  newMessage: string = '';
  activeTab: 'public' | 'private' = 'public';
  isUploader: boolean = false;
  projectId!: number;
  userId!: number;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private sessionStorage: SessionStorageService,
    public dialogRef: MatDialogRef<ProjectChatComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number, uploaderId: number }
  ) {
    this.projectId = data.projectId;
  }

  ngOnInit(): void {
    const user = this.sessionStorage.getUser();
    if (!user || !user.id) {
      this.snackBar.open("Erreur : utilisateur non identifié.", "Fermer", { duration: 3000 });
      this.dialogRef.close();
      return;
    }
    this.userId = user.id;
    // Tous les utilisateurs peuvent envoyer des messages privés,
    // mais seul l'uploader pourra consulter le chat privé.
    this.isUploader = this.userId === this.data.uploaderId;
    this.loadPublicMessages();
    if (this.isUploader) {
      this.loadPrivateMessages();
    }
  }

  switchTab(tab: 'public' | 'private'): void {
    this.activeTab = tab;
    if (tab === 'private' && this.isUploader) {
      this.loadPrivateMessages();
    }
  }

  loadPublicMessages(): void {
    this.http.get<ChatMessage[]>(`http://localhost:8080/api/pchats/${this.projectId}/public`)
      .subscribe({
        next: msgs => this.publicMessages = msgs,
        error: err => this.snackBar.open('Erreur lors du chargement du chat public', 'Fermer', { duration: 3000 })
      });
  }

  loadPrivateMessages(): void {
    this.http.get<ChatMessage[]>(`http://localhost:8080/api/pchats/${this.projectId}/private?requesterId=${this.userId}`)
      .subscribe({
        next: msgs => this.privateMessages = msgs,
        error: err => this.snackBar.open('Erreur lors du chargement des commentaires privés', 'Fermer', { duration: 3000 })
      });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;
  
    const endpoint = (this.activeTab === 'public')
      ? `http://localhost:8080/api/pchats/${this.projectId}/public`
      : `http://localhost:8080/api/pchats/${this.projectId}/private`;

    const payload = {
      senderId: this.userId.toString(),
      message: this.newMessage
    };
  
    this.http.post<ChatMessage>(endpoint, payload)
      .subscribe({
        next: (msg: ChatMessage) => {
          if (this.activeTab === 'public') {
            this.publicMessages.push(msg);
          } else {
            // Seul l'uploader peut consulter le chat privé, 
            // donc si l'utilisateur n'est pas uploader, on affiche une confirmation sans ajouter le message à l'affichage
            if (this.isUploader) {
              this.privateMessages.push(msg);
            } else {
              this.snackBar.open('Votre message privé a été envoyé.', 'Fermer', { duration: 3000 });
            }
          }
          this.newMessage = '';
        },
        error: err => this.snackBar.open('Erreur lors de l\'envoi du message', 'Fermer', { duration: 3000 })
      });
  }
  
  close(): void {
    this.dialogRef.close();
  }
}
