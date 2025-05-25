import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from '@angular/flex-layout';

import { Meeting } from '../../../models/meeting.model';
import { MeetingService } from '../../../services/meeting.service';
import { UserService } from '../../../services/users.service';
import { User } from '../../../models/user.model';
import { forkJoin } from 'rxjs';
import { MatCheckboxModule } from '@angular/material/checkbox';

registerLocaleData(localeFr, 'fr');

@Component({
  selector: 'app-meeting-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatListModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    FlexLayoutModule,
  ],
  templateUrl: './meeting-details.component.html',
  styleUrls: ['./meeting-details.component.css'],
  providers: [{ provide: LOCALE_ID, useValue: 'fr' }]
})
export class MeetingDetailsComponent implements OnInit {
  meeting!: Meeting;
  allUsers: User[] = [];
  editMode = false;
  form!: FormGroup;

  minDate!: string;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private meetingService: MeetingService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const now = new Date();
    // on coupe les secondes/millis
    this.minDate = now.toISOString().substring(0,16);

    // load all users for selection
    this.userService.getAllUsers().subscribe(
      users => this.allUsers = users,
      err => console.error('Erreur chargement users', err)
    );

    const mid = Number(this.route.snapshot.paramMap.get('id'));
    this.meetingService.getById(mid).subscribe(
      m => {
        this.meeting = m;
        this.initForm(m.participantsIds || []);
      },
      err => console.error(err)
    );
  }

   private initForm(ids: number[]): void {
    this.form = this.fb.group({
      subject:      [ this.meeting.subject, Validators.required ],
      date:         [
        this.meeting.date,
        [
          Validators.required,
          this.dateNotInPast.bind(this)   // validateur custom
        ]
      ],
      description:  [ this.meeting.description, Validators.required ],
      participants: [ ids, [ Validators.required, Validators.minLength(1) ] ]
    });
  }

  dateNotInPast(control: FormControl) {
    if (!control.value) return null;
    const chosen = new Date(control.value).getTime();
    const now = new Date().getTime();
    return chosen < now
      ? { past: true }
      : null;
  }
  isChecked(userId: number): boolean {
    const arr = this.form.get('participants')!.value as number[];
    return arr.includes(userId);
  }
  toggleUser(userId: number, checked: boolean): void {
    const ctrl = this.form.get('participants') as FormControl<number[]>;
    const current: number[] = [...(ctrl.value || [])];
    if (checked) {
      if (!current.includes(userId)) current.push(userId);
    } else {
      ctrl.setValue(current.filter(id => id !== userId));
      return;
    }
    ctrl.setValue(current);
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    if (this.editMode) {
      // repasse en édition avec les IDs actuels de la réunion
      this.initForm(this.meeting.participantsIds || []);
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const changes: Partial<Meeting> = {
      subject:         this.form.value.subject,
      date:            this.form.value.date,
      description:     this.form.value.description,
      participantsIds: this.form.value.participants
    };
    this.meetingService.update(this.meeting.id!, changes).subscribe(
      m => {
        this.meeting = m;
        this.editMode = false;
      },
      err => console.error(err)
    );
  }

  /** Typed getter for the participants FormControl<number[]> */
  get participantsControl(): FormControl<number[]> {
    return this.form.get('participants') as FormControl<number[]>;
  }


  cancelMeeting(): void {
    if (!confirm('Voulez-vous vraiment annuler cette réunion ?')) return;
    this.meetingService.delete(this.meeting.id!).subscribe(
      () => this.router.navigate(['/dashboard/espace-adminstrative']),
      err => console.error(err)
    );
  }
}
