import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CallSignal } from '../../../services/webrtc.service';

@Component({
  selector: 'app-incoming-call-dialog',
  imports:[CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  template: `
  <div class="call-popup" [ngClass]="{'video-call': isVideo}">
    <div class="caller-info">
      <img *ngIf="!isVideo" [src]="caller.avatarUrl" alt="avatar" class="caller-avatar">
      <video *ngIf="isVideo" #videoPreview autoplay muted class="caller-video"></video>
      <h3>{{ caller.prenom }} {{ caller.nom }}</h3>
    </div>
    <div class="actions">
      <button mat-mini-fab color="warn" (click)="decline()"><mat-icon>call_end</mat-icon></button>
      <button mat-mini-fab color="primary" (click)="accept()"><mat-icon>{{ isVideo ? 'videocam' : 'call' }}</mat-icon></button>
    </div>
  </div>`,
  styles: [`
    .call-popup { width: 300px; padding: 16px; text-align: center; }
    .caller-avatar, .caller-video { width: 100px; height: 100px; border-radius: 50%; }
    .actions { display: flex; justify-content: space-around; margin-top: 16px; }
  `]
})
export class IncomingCallDialogComponent implements OnInit {
  caller!: any;
  isVideo = false;
  @ViewChild('videoPreview') videoPreview!: ElementRef<HTMLVideoElement>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CallSignal,
    private dialogRef: MatDialogRef<IncomingCallDialogComponent>
  ) {}

  ngOnInit() {
    this.isVideo = this.data.type === 'offer' && !!this.data.sdp?.includes('m=video');
    this.caller = { id: this.data.fromUserId, prenom: '...', nom: '...', avatarUrl: '...'};
  }

  accept() { this.dialogRef.close(true); }
  decline() { this.dialogRef.close(false); }
}