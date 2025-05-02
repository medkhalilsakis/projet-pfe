// src/app/notifications/notifications.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { take } from 'rxjs/operators';           // ← importer take
import { Observable, Subscription, forkJoin } from 'rxjs';
import { NotificationService, NotificationDTO } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notifications',
  standalone: true,
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  imports:[
    CommonModule,
    MatListModule,
    MatIconModule
  ]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications$!: Observable<NotificationDTO[]>;  // ← déclaration sans initializer
  private sub = new Subscription();

  constructor(private notifSvc: NotificationService) {}

  ngOnInit() {
    // On branche la source de notifications **après** que notifSvc soit injecté
    this.notifications$ = this.notifSvc.notifications$;
  }

  markRead(n: NotificationDTO) {
    this.sub.add(
      this.notifSvc.markRead(n.id).subscribe()
    );
  }

  markAllRead() {
    // take(1) pour ne prendre qu’un seul array puis le compléter
    this.sub.add(
      this.notifications$
        .pipe(take(1))
        .subscribe(list => {
          list
            .filter(n => !n.read)
            .forEach(n => this.markRead(n));
        })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
