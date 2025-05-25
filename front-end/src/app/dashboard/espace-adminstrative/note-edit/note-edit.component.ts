import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NoteDecision } from '../../../models/notes.model';
import { NoteDecisionService } from '../../../services/note-decision.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';


export interface NoteEditData {
  note?: NoteDecision;
}

@Component({
  selector: 'app-note-edit',
  templateUrl: './note-edit.component.html',
  styleUrls: ['./note-edit.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule,
    MatDialogModule,
    FlexLayoutModule
  ]
})
export class NoteEditComponent implements OnInit {
  form!: FormGroup;
  types: string[] = ['Note', 'Décision'];
  statuts: string[] = ['Publié', 'En cours', 'Terminé', 'Annulé'];
  selectedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NoteEditComponent, NoteDecision>,
    @Inject(MAT_DIALOG_DATA) public data: NoteEditData,
    private noteService: NoteDecisionService
  ) {}

  ngOnInit(): void {
    // Initialize form, prefill if editing
    this.form = this.fb.group({
      typeNote: [this.data.note?.typeNote || '', Validators.required],
      statut:   [this.data.note?.statut   || '', Validators.required],
      titre:    [this.data.note?.titre    || '', Validators.required],
      contenu:  [this.data.note?.contenu  || '', Validators.required],
      remarque: [this.data.note?.remarque || ''],
      // we don't put fichierJoint control here for validation
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) { return; }
    this.selectedFiles = Array.from(input.files);
  }

  submit(): void {
  if (this.form.invalid) { return; }

  // 1️⃣ Construire l'objet DTO
  const dto: NoteDecision = {
    typeNote: this.form.value.typeNote,
    statut:   this.form.value.statut,
    titre:    this.form.value.titre,
    contenu:  this.form.value.contenu,
    remarque: this.form.value.remarque || '',
    superviseurId: this.data.note?.superviseurId  // ou autre champ si nécessaire
    // ne pas mettre fichierJoint ici
  };

  // 2️⃣ Préparer le FormData
  const formData = new FormData();

  // 2a) Emballer le DTO JSON dans une partie 'data'
  const jsonBlob = new Blob(
    [ JSON.stringify(dto) ],
    { type: 'application/json' }
  );
  formData.append('data', jsonBlob);

  // 2b) Ajouter les fichiers sous la clé 'files'
  this.selectedFiles.forEach(file => {
    formData.append('files', file, file.name);
  });

  // 3️⃣ Appeler create() ou update() selon le cas
  const call$ = this.data.note?.id
    ? this.noteService.update(this.data.note.id, formData)
    : this.noteService.create(formData);

  call$.subscribe({
    next: saved => this.dialogRef.close(saved),
    error: err => console.error('Erreur lors de la sauvegarde', err)
  });
}


  cancel(): void {
    this.dialogRef.close();
  }
}
