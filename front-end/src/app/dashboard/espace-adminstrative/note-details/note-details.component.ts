import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { switchMap } from 'rxjs';
import { NoteDecision } from '../../../models/notes.model';
import { NoteDecisionService } from '../../../services/note-decision.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { NoteEditComponent } from '../note-edit/note-edit.component';

@Component({
  selector: 'app-note-details',
  templateUrl: './note-details.component.html',
  styleUrls: ['./note-details.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule
  ]
})
export class NoteDetailsComponent implements OnInit {
  note?: NoteDecision;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private noteService: NoteDecisionService,
    private dialog: MatDialog 
  ) {}

  ngOnInit(): void {
    // Dès que l'id change dans l'URL, on recharge la note
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return this.noteService.findById(id);
      })
    ).subscribe({
      next: note => {
        this.note = note;
        this.loading = false;
      },
      error: err => {
        this.errorMessage = 'Impossible de charger la note.';
        console.error(err);
        this.loading = false;
      }
    });
  }

  onEdit(): void {
    if (!this.note) { return; }

    // Ouvre le dialog en lui passant la note existante
    const dialogRef = this.dialog.open(NoteEditComponent, {
      width: '600px',
      data: { note: this.note }
    });

    // Après fermeture, on peut rafraîchir l’affichage si la note a été modifiée
    dialogRef.afterClosed().subscribe((updated: NoteDecision | undefined) => {
      if (updated) {
        this.note = updated;
      }
    });
  }

  onDelete(): void {
    if (!this.note?.id) return;
    if (!confirm('Voulez-vous vraiment supprimer cette note ?')) {
      return;
    }
    this.noteService.update(this.note.id, new FormData())
      .subscribe({
        next: () => {
          // Après suppression, retourne à la liste
          this.router.navigate(['/notes']);
        },
        error: err => {
          alert('Erreur lors de la suppression.');
          console.error(err);
        }
      });
  }
}
