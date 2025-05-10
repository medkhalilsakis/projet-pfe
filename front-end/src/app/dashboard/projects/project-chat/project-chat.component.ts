// src/app/.../project-chat.component.ts
import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ChatStompService, ChatMessageDTO } from '../../../services/chat-stomp.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-project-chat',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatInputModule, MatIconModule,
    MatDialogModule
  ],
  templateUrl: './project-chat.component.html',
  styleUrls: ['./project-chat.component.css']
})
export class ProjectChatComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  projectId: number;
  messages: ChatMessageDTO[] = [];
  messageText = '';
  attachments: File[] = [];
  currentUserId!: number;
  readonly API = 'http://localhost:8080/api';

  constructor(
    private chatSvc: ChatStompService,
    private session: SessionStorageService,
    private sanitizer: DomSanitizer,
    private dialogRef: MatDialogRef<ProjectChatComponent>,
    @Inject(MAT_DIALOG_DATA) data: { projectId: number}
  ) {
    this.projectId = data.projectId;
  }

  ngOnInit(): void {
    const u = this.session.getUser();
    this.currentUserId = u?.id;

    this.loadMessages();

    // STOMP events pour suppression
    this.chatSvc.subscribe(
      `/topic/chat.${this.projectId}.delete`,
      frame => {
        const { messageId } = JSON.parse(frame.body);
        this.messages = this.messages.filter(m => m.id !== messageId);
      }
    );
    this.chatSvc.subscribe(
      `/topic/chat.${this.projectId}.deleteAtt`,
      frame => {
        const { attachmentId } = JSON.parse(frame.body);
        this.messages.forEach(m => {
          if (m.attachments) {
            m.attachments = m.attachments.filter(a => a.id !== attachmentId);
          }
        });
      }
    );
  }

  private loadMessages() {
    this.chatSvc.list(this.projectId)
      .subscribe(msgs => {
        this.messages = msgs;
        setTimeout(() => this.scrollToBottom(), 50);
      });
  }

  onFileSelected(evt: Event) {
    const files = (evt.target as HTMLInputElement).files;
    if (!files) return;
    Array.from(files).forEach(f => this.attachments.push(f));
  }

  removeAttachment(i: number) {
    this.attachments.splice(i, 1);
  }

  sendMessage() {
  if (!this.messageText.trim() && !this.attachments.length) return;

  const form = new FormData();
  form.append('senderId', String(this.currentUserId));
  form.append('message', this.messageText);
  this.attachments.forEach(f => form.append('files', f));

  // 1) Envoi HTTP
  this.chatSvc.postMessage(this.projectId, form)
    .subscribe((dto: ChatMessageDTO) => {
      // 2) Publication STOMP
      this.chatSvc.publish('/app/chat.send', {
        projectId: this.projectId,
        senderId: this.currentUserId,
        message: this.messageText,
        id: dto.id  // selon ce que vous attendez en payload
      });

      // reset UI
      this.messageText = '';
      this.attachments = [];
      this.fileInput.nativeElement.value = '';
    });
}


  onDeleteMessage(msg: ChatMessageDTO) {
    if (!confirm('Supprimer ce message ?')) return;
    this.chatSvc.deleteMessage(this.projectId, msg.id)
      .subscribe(() => {
        // local ou stomp 
        this.messages = this.messages.filter(m => m.id !== msg.id);
      });
  }

  sanitizeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  close() {
    this.dialogRef.close();
  }

  private scrollToBottom() {
    const c = document.querySelector('.messages');
    if (c) c.scrollTop = c.scrollHeight;
  }

  getFileIcon(mime: string) {
    if (mime.startsWith('image/')) return '🖼️';
    if (mime.startsWith('video/')) return '🎬';
    if (mime === 'application/pdf') return '📄';
    return '📎';
  }
}
