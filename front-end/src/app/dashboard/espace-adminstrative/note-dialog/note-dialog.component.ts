import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatSelectModule }     from '@angular/material/select';
import { MatOptionModule }     from '@angular/material/core';
import { MatButtonModule }     from '@angular/material/button';
import { FlexLayoutModule }    from '@angular/flex-layout';
import { NoteDecision } from '../../../models/notes.model';


@Component({
  selector: 'app-note-dialog',
  standalone: true,
  imports: [
    CommonModule,
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
  statuts = ['Brouillon', 'Publié', 'Archivé'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NoteDialogComponent, NoteDecision>,
    @Inject(MAT_DIALOG_DATA) public data: { note?: NoteDecision }
  ) {}

  ngOnInit(): void {
    const n = this.data.note;
    this.form = this.fb.group({
      typeNote:      [n?.typeNote || '', Validators.required],
      titre:         [n?.titre      || '', [Validators.required, Validators.minLength(3)]],
      contenu:       [n?.contenu    || '', Validators.required],
      dateCreation:      [n?.dateCreation || new Date().toISOString().substring(0,16)],
      dateModification:  [n?.dateModification || ''],
      statut:        [n?.statut     || this.statuts[0], Validators.required],
      superviseurId: [n?.superviseurId || null],
      remarque:      [n?.remarque   || ''],
      fichierJoint:  [n?.fichierJoint || '']
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    const note: NoteDecision = this.form.value;
    this.dialogRef.close(note);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
