// src/app/task-detail/task-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute }    from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule }      from '@angular/common';
import { MatChipsModule }    from '@angular/material/chips';
import { MatIconModule }     from '@angular/material/icon';
import { MatListModule }     from '@angular/material/list';
import { FlexLayoutModule }  from '@angular/flex-layout';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { EditTaskDialogComponent } from '../edit-task-dialog/edit-task-dialog.component';

interface TacheDetailDTO {
  id: number;
  name: string;
  description?: string;
  outils?: string;
  status: string;
  deadline: string;
  /** Le JSON vient sous la clé `publishedAt` */
  publishedAt: string;
  assignedTo: { id: number; prenom: string; nom: string }[];
  attachments: { id: number; fileName: string; fileType: string }[];
}

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatChipsModule,
    MatIconModule,
    MatListModule,
    FlexLayoutModule,
    NgxExtendedPdfViewerModule
  ],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit {

  task!: TacheDetailDTO;
  pdfUrl?: string;
  pdfAttachments: any[] = [];
  imageAttachments: any[] = [];
  videoAttachments: any[] = [];
  otherAttachments: any[] = [];
  readonly API = 'http://localhost:8080/api';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadTask();
  }

  private loadTask() {
    const id = this.route.snapshot.params['id'];
    this.http.get<TacheDetailDTO>(`${this.API}/taches/${id}`)
      .subscribe(t => {
        this.task = t;
        // classer par type
        this.pdfAttachments = t.attachments.filter(a => a.fileType === 'application/pdf');
        this.imageAttachments = t.attachments.filter(a => a.fileType?.startsWith('image/'));
        this.videoAttachments = t.attachments.filter(a => a.fileType?.startsWith('video/'));
        this.otherAttachments = t.attachments.filter(a => ![...this.pdfAttachments, ...this.imageAttachments, ...this.videoAttachments].includes(a));
        if (this.pdfAttachments.length) {
          // afficher le premier PDF dans viewer
        }
      });
  }

  getStatusLabel(status: string) {
    const map: Record<string,string> = {
      a_developper: 'À développer',
      en_test:      'En test',
      suspendu:     'Suspendu',
      clôturé:      'Clôturé',
      terminé:      'Terminé'
    };
    return map[status] || status;
  }

  getOutilsList(): string[] {
    if (!this.task.outils) return [];
    return this.task.outils.split(',')
               .map(s => s.trim())
               .filter(s => !!s);
  }

  editTask() {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      width: '600px',
      data: { id: this.task.id }
    });

    dialogRef.afterClosed().subscribe(updated => {
      if (updated) {
        this.loadTask();
      }
    });
  }

  downloadAll() {
    const id = this.task.id;
    window.open(`${this.API}/taches/${id}/attachments/zip`, '_blank');
  }
}
