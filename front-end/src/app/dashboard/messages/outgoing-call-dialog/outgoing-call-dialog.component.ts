import { Component, Inject, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WebRtcService } from '../../../services/webrtc.service';
import { Subscription, timer } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

export interface OutgoingCallDialogData {
  isVideo: boolean;
  calleeName: string;
  calleeAvatar: string;
  timeoutMs?: number;
}

@Component({
  selector: 'app-outgoing-call-dialog',
  templateUrl: './outgoing-call-dialog.component.html',
  styleUrls: ['./outgoing-call-dialog.component.css'],
  imports:[CommonModule, FormsModule, ReactiveFormsModule]
})
export class OutgoingCallDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('localVideo',  { static: false }) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: false }) remoteVideo!: ElementRef<HTMLVideoElement>;
  private subs: Subscription[] = [];
  public status: 'calling'|'answered'|'no-response' = 'calling';

  constructor(
    private dialogRef: MatDialogRef<OutgoingCallDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OutgoingCallDialogData,
    private webRtc: WebRtcService
  ) {}

  ngAfterViewInit() {
    // 1) Afficher le localStream quand dispo
    this.subs.push(
      this.webRtc.localStream$
        .subscribe(stream => {
          if (stream && this.localVideo?.nativeElement) {
            this.localVideo.nativeElement.srcObject = stream;
          }
        })
    );
    // 2) Afficher le remoteStream dès qu'il arrive → “answered”
    this.subs.push(
      this.webRtc.remoteStream$
        .subscribe(stream => {
          if (stream && this.remoteVideo?.nativeElement) {
            this.remoteVideo.nativeElement.srcObject = stream;
            this.status = 'answered';
          }
        })
    );
    // 3) Timeout si pas de réponse
    const t = this.data.timeoutMs ?? 30000;
    this.subs.push(
      timer(t).subscribe(() => {
        if (this.status === 'calling') {
          this.status = 'no-response';
        }
      })
    );
  }

  end() {
    this.dialogRef.close(this.status);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
