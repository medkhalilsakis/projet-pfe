import { Component, OnInit }               from '@angular/core';
import { FormBuilder, FormGroup, Validators, AsyncValidatorFn, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef }                    from '@angular/material/dialog';
import { map, catchError, of, throwError } from 'rxjs';
import { UserService, User }               from '../../../services/users.service';
import { RoleService, Role }               from '../../../services/role.service';
import { CommonModule }                    from '@angular/common';

// Angular Material modules
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatSelectModule }     from '@angular/material/select';
import { MatButtonModule }     from '@angular/material/button';
import { MatTooltipModule }    from '@angular/material/tooltip';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.css']
})
export class AddUserDialogComponent implements OnInit {
  form: FormGroup;
  roles: Role[] = [];

  constructor(
    private fb: FormBuilder,
    private userSvc: UserService,
    private roleSvc: RoleService,
    private dialogRef: MatDialogRef<AddUserDialogComponent>
  ) {
    // 1) On initialise le formGroup dans le constructeur
    this.form = this.fb.group({
      nom:            ['', Validators.required],
      prenom:         ['', Validators.required],
      username:       ['', {
                         validators: [Validators.required],
                         asyncValidators: [ this.usernameTakenValidator() ],
                         updateOn: 'blur'
                       }],
      email:          ['', [Validators.required, Validators.email]],
      password:       ['', [Validators.required, Validators.minLength(8)]],
      dateEmbauche:   [null, Validators.required],
      salaire:        [null, [Validators.required, Validators.min(0)]],
      role_id:        [null, Validators.required],
      ncin:           ['', Validators.required],
      genre:          ['Homme', Validators.required]
    });
  }

  ngOnInit(): void {
    // Charger les rôles pour le select
    this.roleSvc.getRoles().subscribe(
      roles => this.roles = roles,
      _err  => { /* gérer l’erreur si besoin */ }
    );
  }

  /** Async-Validator pour vérifier l’unicité du username */
  private usernameTakenValidator(): AsyncValidatorFn {
    return (ctrl: AbstractControl) =>
      this.userSvc.checkUsername(ctrl.value)
        .pipe(
          map(isTaken => isTaken ? { usernameTaken: true } : null),
          catchError(() => of(null))
        );
  }

  /** Soumission du formulaire */
  submit(): void {
    if (this.form.invalid) return;

    // Extraction sécurisée des valeurs
    const fv = this.form.value;
    const rawDate = fv.dateEmbauche;
    let dateString: string;
    if (rawDate instanceof Date) {
      dateString = rawDate.toISOString().split('T')[0];
    } else if (typeof rawDate === 'string') {
      dateString = rawDate;
    } else {
      // ne devrait pas arriver si Validators.required remplit bien
      return;
    }

    // Montée en type du payload
    const payload: User = {
      nom:          fv.nom!,
      prenom:       fv.prenom!,
      username:     fv.username!,
      email:        fv.email!,
      password:     fv.password!,
      dateEmbauche: dateString,
      salaire:      fv.salaire!,
      role_id:      fv.role_id!,
      ncin:         fv.ncin!,
      genre:        fv.genre!
    };

    // Appel API
    this.userSvc.createUser(payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: err => {
        // Affiche l’erreur serveur sur le formulaire
        this.form.setErrors({ serverError: err.error?.message || 'Erreur serveur' });
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
