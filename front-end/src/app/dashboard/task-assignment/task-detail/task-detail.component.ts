import { Component, OnInit } from '@angular/core';
import { ActivatedRoute }    from '@angular/router';
import { HttpClient }        from '@angular/common/http';
import { CommonModule }      from '@angular/common';
import { MatChipsModule }    from '@angular/material/chips';
import { MatIconModule }     from '@angular/material/icon';
import { MatListModule }     from '@angular/material/list';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

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
    MatChipsModule,
    MatIconModule,
    MatListModule,
    NgxExtendedPdfViewerModule
  ],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit {
  task!: TacheDetailDTO;
  pdfUrl?: string;
  otherAttachments: { id: number; fileName: string; fileType: string; }[] = [];
  readonly API = 'http://localhost:8080/api';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.http.get<TacheDetailDTO>(`${this.API}/taches/${id}`)
      .subscribe(t => {
        this.task = t;
        const pdfAtt = t.attachments.find(a => a.fileType === 'application/pdf');
        if (pdfAtt) {
          // URL REST pour stream
          this.pdfUrl = `${this.API}/taches/attachments/${pdfAtt.id}`;
          //this.pdfUrl = `https://www.ecam.fr/wp-content/uploads/2016/06/Exemple-fichier-PDF-1.pdf`;
        }
        this.otherAttachments = t.attachments.filter(a => a.fileType !== 'application/pdf');
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
}
