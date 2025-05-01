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

  public remoteStream$ = new BehaviorSubject<MediaStream | null>(null);
  public incomingCallSignal$ = new Subject<CallSignal>();

  connectSignaling(selfId: number) {
    const socket = new SockJS(`http://localhost:8080/ws`);
    this.stomp = new Client({ webSocketFactory: () => socket, reconnectDelay: 5000, connectHeaders: { 'X-User-Id': `${selfId}` } });
    this.stomp.onConnect = () => {
      this.stomp.subscribe(`/topic/call/${selfId}`, (m: IMessage) => {
        const signal: CallSignal = JSON.parse(m.body);
        if (signal.type === 'offer') this.incomingCallSignal$.next(signal);
        else this.handleSignal(signal);
      });
    };
    this.stomp.activate();
  }

  async initCall(localStream: MediaStream, targetUserId: number, selfId: number) {
    this.setupPeer(localStream, targetUserId, selfId);
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.send({ type: 'offer', fromUserId: selfId, targetUserId, sdp: JSON.stringify(offer) });
  }

  async answerCall(localStream: MediaStream, signal: CallSignal, selfId: number) {
    this.setupPeer(localStream, signal.fromUserId, selfId);
    await this.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(signal.sdp!)));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    this.send({ type: 'answer', fromUserId: selfId, targetUserId: signal.fromUserId, sdp: JSON.stringify(answer) });
  }

  private setupPeer(localStream: MediaStream, targetUserId: number, selfId: number) {
    this.pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    localStream.getTracks().forEach(t => this.pc.addTrack(t, localStream));
    const remote = new MediaStream();
    this.pc.ontrack = e => { remote.addTrack(e.track); this.remoteStream$.next(remote); };
    this.pc.onicecandidate = e => { if (e.candidate) this.send({ type: 'ice', fromUserId: selfId, targetUserId, candidate: JSON.stringify(e.candidate) }); };
  }

  private async handleSignal(signal: CallSignal) {
    if (signal.type === 'answer') await this.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(signal.sdp!)));
    else if (signal.type === 'ice') await this.pc.addIceCandidate(new RTCIceCandidate(JSON.parse(signal.candidate!)));
    else if (signal.type === 'end') this.pc.close();
  }

  endCall(targetUserId: number, selfId: number, reason: 'hangup' | 'missed') {
    this.send({ type: 'end', fromUserId: selfId, targetUserId, sdp: reason });
    this.pc.close();
  }

  private send(msg: Partial<CallSignal>) {
    this.stomp.publish({ destination: `/app/call.${msg.type}`, body: JSON.stringify(msg) });
  }
}