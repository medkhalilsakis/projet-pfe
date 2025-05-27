import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ChatStompService } from '../../../services/chat-stomp.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ChatMessageDTO } from '../../../models/chat-message.model';

@Component({
  selector: 'app-project-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './project-chat.component.html',
  styleUrls: ['./project-chat.component.css']
})
export class ProjectChatComponent implements OnInit {
  /** Si on est en inline, on passe le projectId en input. */
  @Input() projectId!: number;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  messages: ChatMessageDTO[] = [];
  messageText = '';
  attachments: File[] = [];
  currentUserId!: number;
  readonly API = 'http://localhost:8080/api';

  constructor(
    private chatSvc: ChatStompService,
    private session: SessionStorageService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute   // <- pour le mode “page”
  ) {}

  ngOnInit(): void {
    // Si on n'a pas reçu de `projectId` en @Input, on le récupère dans le param de route
    if (!this.projectId) {
      const pid = this.route.snapshot.paramMap.get('id') 
               || this.route.snapshot.paramMap.get('projectId');
      this.projectId = pid ? +pid : NaN;
    }
    if (isNaN(this.projectId)) {
      throw new Error('ProjectChatComponent : projectId introuvable !');
    }

    // on peut maintenant charger
    const u = this.session.getUser();
    this.currentUserId = u?.id!;

    this.loadMessages();

    // abonnement STOMP pour nouveaux msgs
    this.chatSvc.subscribe(
      `/topic/chat.${this.projectId}`,
      frame => {
        const newMsg: ChatMessageDTO = JSON.parse(frame.body);
        this.messages.push(newMsg);
        setTimeout(() => this.scrollToBottom(), 50);
      }
    );

    // abonnement suppr messages
    this.chatSvc.subscribe(
      `/topic/chat.${this.projectId}.delete`,
      frame => {
        const { messageId } = JSON.parse(frame.body);
        this.messages = this.messages.filter(m => m.id !== messageId);
      }
    );

    // abonnement suppr pièces jointes
    this.chatSvc.subscribe(
      `/topic/chat.${this.projectId}.deleteAtt`,
      frame => {
        const { attachmentId } = JSON.parse(frame.body);
        this.messages.forEach(m => {
          m.attachments = m.attachments
                         ?.filter(a => a.id !== attachmentId);
        });
      }
    );
  }

  private loadMessages(): void {
    this.chatSvc.list(this.projectId)
      .subscribe(msgs => {
        this.messages = msgs;
        setTimeout(() => this.scrollToBottom(), 50);
      });
  }

  onFileSelected(evt: Event) {
    const files = (evt.target as HTMLInputElement).files;
    if (!files) return;
    this.attachments.push(...Array.from(files));
  }

  removeAttachment(i: number) {
    this.attachments.splice(i, 1);
  }

  sendMessage() {
  if (!this.messageText.trim() && !this.attachments.length) return;

  const form = new FormData();
  form.append('senderId', `${this.currentUserId}`);
  form.append('message', this.messageText);
  this.attachments.forEach(f => form.append('files', f));

  this.chatSvc.postMessage(this.projectId, form)
    .subscribe(dto => {
      // 1) On injecte tout de suite le message dans l’UI
      this.messages.push(dto);
      setTimeout(() => this.scrollToBottom(), 50);

      // 2) On notifie le back pour diffusion STOMP (aux autres clients)
      this.chatSvc.publish('/app/chat.send', {
        projectId: this.projectId,
        senderId: this.currentUserId,
        message: this.messageText,
        id: dto.id
      });

      // 3) Reset du composer
      this.messageText = '';
      this.attachments = [];
      this.fileInput.nativeElement.value = '';
    });
}


  onDeleteMessage(msg: ChatMessageDTO) {
    if (!confirm('Supprimer ce message ?')) return;
    this.chatSvc.deleteMessage(this.projectId, msg.id)
      .subscribe(() => {
        this.messages = this.messages.filter(m => m.id !== msg.id);
      });
  }

  /** Supprime une pièce jointe côté serveur + notifie STOMP */
  onDeleteAttachment(attId: number) {
    this.chatSvc.deleteAttachment(this.projectId, attId)
      .subscribe(() => {
        this.messages.forEach(m => {
          m.attachments = m.attachments?.filter(a => a.id !== attId);
        });
      });
  }

  sanitizeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
