import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChatMessage, ChatService } from '../../../services/chat.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-chat',
  templateUrl: './project-chat.component.html',
  styleUrls: ['./project-chat.component.css'],
  imports:[
    CommonModule,
    MatDialogModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule
  ]
})
export class ProjectChatComponent implements OnInit {
  projectId!: number;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  loading = false;

  constructor(
    private chatService: ChatService,
    private dialogRef: MatDialogRef<ProjectChatComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number },
    private session: SessionStorageService,
    private snackBar: MatSnackBar
  ) {
    this.projectId = data.projectId;
  }

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading = true;
    this.chatService.getMessages(this.projectId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des messages', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;
    const senderId = this.session.getUser().id;
    this.chatService.sendMessage(this.projectId, senderId, this.newMessage).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.newMessage = '';
      },
      error: () => {
        this.snackBar.open('Erreur lors de l\'envoi du message', 'Fermer', { duration: 3000 });
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
