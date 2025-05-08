import {
  Component, Inject, OnInit,
  AfterViewChecked, OnDestroy,
  ViewChild, ElementRef
} from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogModule, MatDialogRef
} from '@angular/material/dialog';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription, forkJoin } from 'rxjs';
import { SessionStorageService } from '../../../services/session-storage.service';
import { ChatStompService } from '../../../services/chat-stomp.service';
import { ProjectChatAttachment } from '../../../models/project-chat-attachment.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export interface ChatMessage {
  id: number;
  message: string;
  createdAt: string;
  sender: { id: number; prenom: string; nom: string };
  attachments?: ProjectChatAttachment[];
}

@Component({
  selector: 'app-project-chat',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatIconModule, MatButtonModule, MatInputModule, MatDialogModule
  ],
  templateUrl: './project-chat.component.html',
  styleUrls: ['./project-chat.component.css']
})
export class ProjectChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('scrollMe') private scrollContainer!: ElementRef;
  publicMessages: ChatMessage[] = [];
  newMessage = '';
  selectedFiles: File[] = [];
  projectId!: number;
  userId!: number;
  readonly API = 'http://localhost:8080/api';
  private subs = new Subscription();

  constructor(
    private http: HttpClient,
    private session: SessionStorageService,
    private chatStomp: ChatStompService,
    public dialogRef: MatDialogRef<ProjectChatComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number }
  ) {
    this.projectId = data.projectId;
  }

  ngOnInit(): void {
    const u = this.session.getUser();
    if (!u?.id) return this.dialogRef.close();
    this.userId = u.id;
    this.loadMessages();
    const connSub = this.chatStomp.connected$.subscribe(ok => {
      if (!ok) return;
      this.subs.add(
        this.chatStomp.watchPublic(this.projectId)
          .subscribe(msg => {
            this.decorateUrls([msg]);
            this.publicMessages.push(msg);
            this.scrollToBottom();
          })
      );
      connSub.unsubscribe();
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
  ngOnDestroy(): void { this.subs.unsubscribe(); }

  private loadMessages() {
    this.http.get<ChatMessage[]>(`${this.API}/pchats/${this.projectId}`)
      .subscribe(msgs => {
        this.decorateUrls(msgs);
        this.publicMessages = msgs;
        setTimeout(() => this.scrollToBottom(), 0);
      });
  }

  /** Ajoute `url` à chaque attachment */
  private decorateUrls(msgs: ChatMessage[]) {
    msgs.forEach(m => {
      m.attachments?.forEach(att => {
        att.url = `${this.API}/pchats/messages/${m.id}/attachments/${att.id}`;
      });
    });
  }

  onFilesSelected(evt: Event) {
    const inp = evt.target as HTMLInputElement;
    if (!inp.files) return;
    this.selectedFiles = Array.from(inp.files);
  }

  sendMessage() {
    const txt = this.newMessage.trim();
    if (!txt && !this.selectedFiles.length) return;

    this.http.post<ChatMessage>(
      `${this.API}/pchats/${this.projectId}/messages`,
      null,
      { params: new HttpParams()
            .set('senderId', this.userId.toString())
            .set('message', txt) }
    ).subscribe(created => {
      if (this.selectedFiles.length) {
        const uploads = this.selectedFiles.map(f => {
          const fd = new FormData();
          fd.append('file', f, f.name);
          return this.http.post<ProjectChatAttachment>(
            `${this.API}/pchats/messages/${created.id}/attachments`,
            fd
          );
        });
        forkJoin(uploads).subscribe(() => this.loadMessages());
      } else {
        this.decorateUrls([created]);
        this.publicMessages.push(created);
      }
      this.newMessage = '';
      this.selectedFiles = [];
      this.scrollToBottom();
    });
  }

  close() { this.dialogRef.close(); }

  private scrollToBottom() {
    try {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
