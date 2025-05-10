/* src/app/components/parametres-projet/parametres-projet.component.ts */
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ProjectService } from '../../../services/project.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { UserService } from '../../../services/users.service';
import { User } from '../../../models/user.model';
import { Project } from '../../../models/project.model';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from '@angular/flex-layout';


@Component({
  selector: 'app-parametres-projet',
  templateUrl: './parametres-projet.component.html',
  styleUrls: ['./parametres-projet.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatListModule,
    MatOptionModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    FlexLayoutModule
  ]
})
export class ParametresProjetComponent implements OnInit {
  projectId!: number;
  project!: Project;
  currentUserId!: number;
  form!: FormGroup;

  invitedUsers: { id: number; name: string; status: string; inviteId: number }[] = [];
  availableUsers: User[] = [];
  selectedUserId!: number;

  constructor(
    private dialogRef: MatDialogRef<ParametresProjetComponent>,
    @Inject(MAT_DIALOG_DATA) data: { projectId: number },
    private fb: FormBuilder,
    private projectService: ProjectService,
    private sessionStorageService: SessionStorageService,
    private userService: UserService
  ) {
    this.projectId = data.projectId;
  }

  ngOnInit(): void {
    const currentUser = this.sessionStorageService.getUser();
    this.currentUserId = currentUser?.id ?? null;
    this.initForm();

    // Charger projet puis invitations puis utilisateurs disponibles
    this.projectService.getProjectById(this.projectId).subscribe(proj => {
      this.project = proj;
      this.form.patchValue({
        name: proj.name,
        type: proj.type,
        description: proj.description,
        visibilite: proj.visibilite
      });
      this.loadInvites();
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: [''],
      description: [''],
      visibilite: ['', Validators.required]
    });
  }

  private loadInvites(): void {
    this.projectService.getInvitedUsers(this.projectId).subscribe(list => {
      this.invitedUsers = list.map((u: any) => ({
        id: u.userId,
        name: `${u.prenom} ${u.nom}`,
        status: u.status,
        inviteId: u.id
      }));
      this.loadAvailableUsers();
    });
  }

  private loadAvailableUsers(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.availableUsers = users
        .filter(u => u.id !== this.project.user.id)
        .filter(u => !this.invitedUsers.some(i => i.id === u.id));
    });
  }

  save(): void {
    if (this.form.invalid) { return; }
    const payload = {
      name: this.form.value.name,
      type: this.form.value.type,
      description: this.form.value.description,
      visibilite: this.form.value.visibilite,
      status: this.project.status?.toString() || '0'
    };
    this.projectService.commitProject(this.projectId, payload).subscribe(() => this.dialogRef.close(true));
  }

  updateVisibilite(): void {
    const status = this.project.status ?? 0;
    if (![0, 1].includes(status)) { return; }
    const vis = this.form.value.visibilite;
    this.projectService.updateVisibility(this.projectId, this.currentUserId, vis, status)
      .subscribe(() => { this.project.visibilite = vis; });
  }

  invite(): void {
    if (!this.selectedUserId) { return; }
    this.projectService.inviteUser(this.projectId, this.selectedUserId)
      .subscribe(() => this.loadInvites());
  }

  cancelInvite(inviteId: number): void {
    this.projectService.cancelInvite(this.projectId, inviteId)
      .subscribe(() => this.loadInvites());
  }

  isOwner(): boolean {
    if (!this.project || !this.project.user) {
      return false;
    }
    return this.currentUserId === this.project.user.id;
  }

  close(): void {
    this.dialogRef.close(false);
  }
}