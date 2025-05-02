// incoming-call-dialog.component.ts
import { Component, Inject, ViewChild, ElementRef, AfterViewInit, OnDestroy }
     from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef }
     from '@angular/material/dialog';
import { CallSignal, WebRtcService } from '../../../services/webrtc.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-incoming-call-dialog',
  templateUrl: './incoming-call-dialog.component.html',
  styleUrls: ['./incoming-call-dialog.component.css'],
  imports:[CommonModule, FormsModule, ReactiveFormsModule]
})
export class IncomingCallDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('localVideo',  { static: false }) localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: false }) remoteVideo!: ElementRef<HTMLVideoElement>;

  isVideo: boolean;
  private subs: Subscription[] = [];

  constructor(
    private dialogRef: MatDialogRef<IncomingCallDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IncomingCallDialogData,
    private webRtc: WebRtcService
  ) {
    this.isVideo = !!data.sdp?.includes('m=video');
  }

  ngAfterViewInit() {
    if (!this.isVideo) return;

    // 1) Afficher le stream local dès que disponible
    this.subs.push(
      this.webRtc.localStream$
        .subscribe(stream => {
          if (stream && this.localVideo?.nativeElement) {
            this.localVideo.nativeElement.srcObject = stream;
          }
        })
    );

    // 2) Afficher le stream distant dès qu'il arrive
    this.subs.push(
      this.webRtc.remoteStream$
        .subscribe(stream => {
          if (stream && this.remoteVideo?.nativeElement) {
            this.remoteVideo.nativeElement.srcObject = stream;
          }
        })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  accept()  { this.dialogRef.close(true);  }
  decline() { this.dialogRef.close(false); }
}
export interface IncomingCallDialogData extends CallSignal {
  callerName:   string;
  callerAvatar: string;
  calleeAvatar: string;
}