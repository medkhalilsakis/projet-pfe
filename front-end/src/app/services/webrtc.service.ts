/* src/app/services/webrtc.service.ts */
import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Subject } from 'rxjs';

export interface CallSignal {
  type: 'offer' | 'answer' | 'ice' | 'end';
  fromUserId: number;
  targetUserId: number;
  sdp?: string;
  candidate?: string;
}

@Injectable({ providedIn: 'root' })
export class WebRtcService {
  private pc!: RTCPeerConnection;
  private stomp!: Client;

  /** Local media stream */
  public localStream$ = new BehaviorSubject<MediaStream | null>(null);
  /** Remote media stream */
  public remoteStream$ = new BehaviorSubject<MediaStream | null>(null);
  /** Incoming call offers */
  public incomingCallSignal$ = new Subject<CallSignal>();

  /** Queue to buffer ICE candidates received before peer is ready */
  private pendingIce: RTCIceCandidateInit[] = [];

  /** Connect to signaling server via STOMP */
  connectSignaling(selfId: number): void {
    const socket = new SockJS(`http://localhost:8080/ws`);
    this.stomp = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: { 'X-User-Id': `${selfId}` }
    });

    this.stomp.onConnect = () => {
      this.stomp.subscribe(`/topic/call/${selfId}`, (m: IMessage) => {
        const signal: CallSignal = JSON.parse(m.body);
        if (signal.type === 'offer') {
          // Notify app of incoming call
          this.incomingCallSignal$.next(signal);
        } else {
          // Handle answer, ice, end
          this.handleSignal(signal);
        }
      });
    };

    this.stomp.activate();
  }

  /** Initiate a call: send offer */
  async initCall(localStream: MediaStream, targetUserId: number, selfId: number): Promise<void> {
    // Publish local stream to subscribers
    this.localStream$.next(localStream);

    // Create peer connection and add tracks
    this.setupPeer(localStream, targetUserId, selfId);

    // Create and send SDP offer
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.send({ type: 'offer', fromUserId: selfId, targetUserId, sdp: JSON.stringify(offer) });
  }

  /** Answer an incoming call offer */
  async answerCall(localStream: MediaStream, signal: CallSignal, selfId: number): Promise<void> {
    // Publish local stream to subscribers
    this.localStream$.next(localStream);

    // Create peer connection and add tracks
    this.setupPeer(localStream, signal.fromUserId, selfId);

    // Set remote description with received offer
    await this.pc.setRemoteDescription(
      new RTCSessionDescription(JSON.parse(signal.sdp!))
    );

    // Replay any ICE candidates received early
    for (const candInit of this.pendingIce) {
      await this.pc.addIceCandidate(new RTCIceCandidate(candInit));
    }
    this.pendingIce = [];

    // Create and send SDP answer
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this.send({
      type: 'answer',
      fromUserId: selfId,
      targetUserId: signal.fromUserId,
      sdp: JSON.stringify(answer)
    });
  }

  /** Configure RTCPeerConnection, streams and ICE handlers */
  private setupPeer(localStream: MediaStream, targetUserId: number, selfId: number): void {
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // Add local tracks
    localStream.getTracks().forEach(track => {
      this.pc.addTrack(track, localStream);
    });

    // Prepare remote stream container
    const remote = new MediaStream();
    this.pc.ontrack = (event) => {
      remote.addTrack(event.track);
      this.remoteStream$.next(remote);
    };

    // Emit local ICE candidates via signaling
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.send({
          type: 'ice',
          fromUserId: selfId,
          targetUserId,
          candidate: JSON.stringify(event.candidate)
        });
      }
    };
  }

  /** Handle incoming SDP answers, ICE and end signals */
  private async handleSignal(signal: CallSignal): Promise<void> {
    switch (signal.type) {
      case 'answer':
        if (!this.pc || !signal.sdp) return;
        await this.pc.setRemoteDescription(
          new RTCSessionDescription(JSON.parse(signal.sdp))
        );
        break;

      case 'ice':
        if (!signal.candidate) return;
        const candInit: RTCIceCandidateInit = JSON.parse(signal.candidate);

        if (this.pc && this.pc.remoteDescription) {
          try {
            await this.pc.addIceCandidate(new RTCIceCandidate(candInit));
          } catch (err) {
            console.warn('Error adding ICE candidate', err);
          }
        } else {
          // Buffer ICE until remoteDescription is set
          this.pendingIce.push(candInit);
        }
        break;

      case 'end':
        this.pc?.close();
        break;
    }
  }

  /** Terminate call, send end notification */
  endCall(targetUserId: number, selfId: number, reason: 'hangup' | 'missed'): void {
    this.send({ type: 'end', fromUserId: selfId, targetUserId, sdp: reason });
    this.pc?.close();
  }

  /** Publish signaling message */
  private send(msg: Partial<CallSignal>): void {
    this.stomp.publish({
      destination: `/app/call.${msg.type}`,
      body: JSON.stringify(msg)
    });
  }
}
