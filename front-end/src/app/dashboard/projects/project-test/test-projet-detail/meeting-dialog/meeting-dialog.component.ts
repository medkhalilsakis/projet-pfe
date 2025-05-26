import { Component, Inject } from '@angular/core';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../../../../services/users.service';
import { SessionStorageService } from '../../../../../services/session-storage.service';
import { User } from '../../../../../models/user.model';
import { Meeting } from '../../../../../models/meeting.model';

@Component({
  selector: 'app-meeting-dialog',
  templateUrl: './meeting-dialog.component.html',
  styleUrl: './meeting-dialog.component.css',
  imports:[
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FlexLayoutModule
  ]
})
export class MeetingDialogComponent {
  form;
  searchControl = new FormControl('');
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  currentUserId!: number;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private session: SessionStorageService,
    public dialogRef: MatDialogRef<MeetingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { /* vous pouvez passer quoi que ce soit ici */ }
  ) {
    this.form = this.fb.group({
      subject:       ['', Validators.required],
      date:          ['', Validators.required],
      participantsIds:  [<number[]>[], Validators.required],
      description:   [''],
      attachments:   [null]
    });
    
  }

  ngOnInit(): void {
    // Récupérer l'ID du testeur connecté
    const me = this.session.getUser();
    this.currentUserId = me?.id!;

    // Charger tous les utilisateurs (côté serveur)
    this.userService.getAllUsers().subscribe(users => {
      // Exclure l'utilisateur courant
      this.allUsers = users.filter(u => u.id !== this.currentUserId);
      // Initialiser la liste filtrée
      this.filteredUsers = [...this.allUsers];
    });

    // Réagir à la recherche
    this.searchControl.valueChanges.subscribe(term => {
      const filter = term?.toLowerCase() || '';
      this.filteredUsers = this.allUsers.filter(u =>
        `${u.nom} ${u.prenom}`.toLowerCase().includes(filter)
      );
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.value as Meeting;
    // s'assurer d'avoir un tableau même vide
    raw.participantsIds = raw.participantsIds || [];
    this.dialogRef.close(raw);
  }
  

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.form.patchValue({ attachments: input.files as any });
    }
  }
}
