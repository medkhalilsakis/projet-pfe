
// add-invitation-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../models/user.model';
import { ProjectService } from '../../../services/project.service';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatListModule, MatSelectionList } from '@angular/material/list';


@Component({
  selector: 'app-add-invitation-dialog',
  templateUrl: './add-invitation-dialog.component.html',
  styleUrls: ['./add-invitation-dialog.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatListModule
  ]
})
export class AddInvitationDialogComponent implements OnInit {
  form: FormGroup;
  invitedUsers: User[]     = [];
  inviteableUsers: User[]  = [];
  loading                  = false;
  processingInvites        = false;
  errorMessage             = '';

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    public dialogRef: MatDialogRef<AddInvitationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number }
  ) {
    this.form = this.fb.group({
      users: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.loading = true;
    const pid = this.data.projectId;

    // 1) charger déjà invités
    this.projectService.getInvitedUsers(pid).subscribe({
      next: inv => {
        this.invitedUsers = inv;
        // 2) charger candidats invitables
        this.projectService.getInviteableUsers(pid).subscribe({
          next: cands => {
            this.inviteableUsers = cands;
            // pré-cocher ceux déjà invités
            const pre = this.inviteableUsers
                          .filter(u => this.invitedUsers.some(i=>i.id===u.id))
                          .map(u=>u.id);
            this.form.get('users')!.setValue(pre);
            this.loading = false;
          },
          error: () => {
            this.errorMessage = "Impossible de charger les candidats";
            this.loading = false;
          }
        });
      },
      error: () => {
        this.errorMessage = "Impossible de charger les invités";
        this.loading = false;
      }
    });
  }

  /** filtring */
  get filteredInviteableUsers(): User[] {
    const q = (this.data as any).userFilter?.toLowerCase()?.trim() || '';
    return this.inviteableUsers.filter(u =>
      `${u.prenom} ${u.nom}`.toLowerCase().includes(q)
    );
  }

  /** appel aux invitations */
  submit(): void {
    if (this.form.invalid) return;

    const pid = this.data.projectId;
    const toInvite: number[] = this.form.value.users;

    this.processingInvites = true;
    // Appel parallèle à inviteUser()
    forkJoin(
      toInvite.map(uid =>
        this.projectService.inviteUser(pid, uid, 'pending')
      )
    ).subscribe({
      next: () => {
        this.processingInvites = false;
        // On referme avec la liste (si besoin)
        this.dialogRef.close({ invited: toInvite });
        
      },
      error: () => {
        this.processingInvites = false;
        this.errorMessage = "Erreur lors de l'envoi des invitations";
      }
    });
    this.dialogRef.close();
    
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
