import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatSelectModule }     from '@angular/material/select';
import { MatOptionModule }     from '@angular/material/core';
import { MatButtonModule }     from '@angular/material/button';

import { NoteDecision } from '../../../models/notes.model';
import { NoteDecisionService } from '../../../services/note-decision.service';
import { SessionStorageService } from '../../../services/session-storage.service';

@Component({
  selector: 'app-note-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    FlexLayoutModule
  ],
  templateUrl: './note-dialog.component.html',
  styleUrls: ['./note-dialog.component.css']
})
export class NoteDialogComponent implements OnInit {
  form!: FormGroup;
  types = ['Note', 'Décision'];
  statuts = ['Publié', 'En cours', 'Terminé', 'Annulé'];
  selectedFiles?: FileList;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NoteDialogComponent, NoteDecision>,
    @Inject(MAT_DIALOG_DATA) public data: { note?: NoteDecision },
    private noteService: NoteDecisionService,
    private sessionService: SessionStorageService
  ) {}

  ngOnInit(): void {
    const n = this.data.note;
    this.form = this.fb.group({
      typeNote:     [n?.typeNote      || '', Validators.required],
      titre:        [n?.titre         || '', [Validators.required, Validators.minLength(3)]],
      contenu:      [n?.contenu       || '', Validators.required],
      statut:       [n?.statut        || this.statuts[0], Validators.required],
      remarque:     [n?.remarque      || ''],
      fichierJoint: [null]
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFiles = input.files || undefined;
    this.form.patchValue({ fichierJoint: this.selectedFiles });
  }

  submit(): void {
  if (this.form.invalid) return;

  // Récupérer l’ID du superviseur
  const user = this.sessionService.getUser();
  const supId = user?.id;

  // Construire un objet "data" sans fichierJoint
  const dataPayload = {
    typeNote: this.form.value.typeNote,
    titre:    this.form.value.titre,
    contenu:  this.form.value.contenu,
    statut:   this.form.value.statut,
    // on fournit explicitement l'utilisateur lié
    superviseur: { id: supId },
    remarque: this.form.value.remarque
    // ne PAS inclure fichierJoint ici !
  };

  // Préparer le multipart/form-data
  const formData = new FormData();
  formData.append(
    'data',
    new Blob([ JSON.stringify(dataPayload) ], { type: 'application/json' })
  );

  // Ajouter les fichiers sélectionnés (s’il y en a)
  if (this.selectedFiles?.length) {
    Array.from(this.selectedFiles).forEach(f =>
      formData.append('files', f, f.name)
    );
  }

  // Lancer la requête create ou update
  const call$ = this.data.note?.id
    ? this.noteService.update(this.data.note.id, formData)
    : this.noteService.create(formData);

  call$.subscribe(res => this.dialogRef.close(res));
}



  cancel(): void {
    this.dialogRef.close();
  }
}
