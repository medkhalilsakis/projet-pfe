// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { ComplaintService } from '../../services/complaint.service';
import { PauseRequestService } from '../../services/pause-request.service';
import { DatePipe } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../services/users.service';
import { MeetingService } from '../../services/meeting.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStorageService } from '../../services/session-storage.service';
import { User } from '../../models/user.model';
import { ProjectService } from '../../services/project.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HolidayService } from '../../services/holiday.service';
import { MbscCalendarColor, MbscCalendarLabel, MbscCalendarMarked, setOptions /* localeImport */ } from '@mobiscroll/angular';
import { dyndatetime } from '../../../app/app.util';
import { MbscDatepickerModule } from '@mobiscroll/angular';
import { MbscModule } from '@mobiscroll/angular';
import { ChangeDetectorRef } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NoteDecisionService } from '../../services/note-decision.service';
import { NoteDialogComponent } from './note-dialog/note-dialog.component';
import { Meeting } from '../../models/meeting.model';
import { MeetingDialogComponent } from './meeting-dialog/meeting-dialog.component';

setOptions ( {
  theme: 'ios', // or other theme
  lang: 'en'
});
@Component({
  selector: 'app-espace-administrative',
  imports: [
    MatDatepickerModule,
    CommonModule,
    FormsModule,
    MatNativeDateModule,
    MatCardModule,
    MatTabsModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    CommonModule,
    MbscDatepickerModule,
    MbscModule,
    MatSelectModule,
    MatOptionModule,
    FlexLayoutModule
  ],
  templateUrl: './espace-adminstrative.component.html',
  styleUrl: './espace-adminstrative.component.css',
  providers: [DatePipe],
  standalone: true,

})
export class EspaceAdminstrativeComponent implements OnInit {
  complaints: any[] = [];
  pauseRequests: any[] = [];
  meetings: any[] = [];
  meetingDates: any[] = [];
  projects: any[] = [];
  publicHolidays: any[] = [];
  selectedDate: Date | null = null;
  showProjectList = false;
  daysToHighlight: any[] = [];
  deadLines: any[] = [];
  tâches :any;
  notes: any[] = [];
coloredDays: MbscCalendarColor[] = [
    { recurring: { repeat: 'yearly', month: 1, day: 1 }, background: 'red' },
    { recurring: { repeat: 'yearly', month: 3, day: 20 }, background: 'red' },
    { recurring: { repeat: 'yearly', month: 4, day: 9 }, background: 'red' },
    { recurring: { repeat: 'yearly', month: 5, day: 1 }, background: 'red' },
    { recurring: { repeat: 'yearly', month: 7, day: 25 }, background: 'red' },
    { recurring: { repeat: 'yearly', month: 8, day: 13 }, background: 'red' },
    { recurring: { repeat: 'yearly', month: 10, day: 15 }, background: 'red' },
    { recurring: { repeat: 'yearly', month: 12, day: 17 }, background: 'red' },
  ];

  labelDays: MbscCalendarLabel[] = [
    { recurring: { repeat: 'yearly', month: 1, day: 1 }, title: "New Year's Day" },
    { recurring: { repeat: 'yearly', month: 3, day: 20 }, title: "Independence Day"},
    { recurring: { repeat: 'yearly', month: 4, day: 9 }, title: "Martyrs' Day" },
    { recurring: { repeat: 'yearly', month: 5, day: 1 }, title: "Labour Day" },
    { recurring: { repeat: 'yearly', month: 7, day: 25 }, title:"Republic Day"},
    { recurring: { repeat: 'yearly', month: 8, day: 13 }, title:  "Women's Day" },
    { recurring: { repeat: 'yearly', month: 10, day: 15 }, title: "Evacuation Day"},
    { recurring: { repeat: 'yearly', month: 12, day: 17 }, title: "Revolution Day" },
  ];

  
  constructor(
    private noteSvc: NoteDecisionService,
    private complaintService: ComplaintService,
    private pauseRequestService: PauseRequestService,
    private meetingService: MeetingService,
    private holidayService: HolidayService,
    private projectService: ProjectService,
    private userService: UserService,
    private session: SessionStorageService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private router: Router,
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    
    this.initProjects();
    this.loadComplaints();
    this.loadPauseRequests();
    this.loadAllMeetings();
    this.loadTasks();
    this.loadNotes();
  }
  isSuperviser(){
    const user =this.session.getUser()
    return (user.role.id===3)
  }

  private initProjects() {
    this.projectService.getAllProjects().subscribe(
      data => this.projects = data,
      err => console.error('Could not load projects', err)
    );
  }

  rootToProject(projectId: number) {
    console.log('navigating to project', projectId);
    this.router.navigate(['/dashboard/projects', projectId]);
  }

 loadComplaints() {
  this.projectService.getAllProjects().pipe(
    // 1) Stocke la liste des projets
    tap(prjs => this.projects = prjs),

    // 2) Récupère toutes les réclamations
    switchMap(() => this.complaintService.getAllComplaints()),

    // 3) Pour chaque réclamation, ajoute projectName
    map(comps =>
      comps.map(c => ({
        ...c,
        project: this.projects.find(p => p.id === c.projectId) || '—'
      }))
    )
  )
  // 4) Abonne‐toi et stocke le résultat enrichi
  .subscribe(
    enrichedComps => {
      this.complaints = enrichedComps;
      console.log('Complaints:', this.complaints);
    },
    err => console.error('Error loading complaints', err)
  );
}


 loadPauseRequests() {
  this.projectService.getAllProjects().pipe(
    // 1) Stocke d’abord les projets
    tap(prjs => this.projects = prjs),

    // 2) Pour chaque projet, récupère ses pause-requests
    switchMap(prjs =>
      forkJoin(
        prjs.map(p =>
          this.pauseRequestService.list(p.id)
            .pipe(catchError(() => of([])))   // au cas où une liste échoue
        )
      )
    ),

    // 3) Aplatis le tableau de tableaux
    map(listOfLists => listOfLists.flat()),

    // 4) Ajoute projectName à chaque requête
    map(reqs =>
      reqs.map(r => ({
        ...r,
        project: this.projects.find(p => p.id === r.projectId) || '—'
      }))
    )
  )
  // 5) Abonne-toi et stocke le résultat final
  .subscribe(
    enrichedReqs => this.pauseRequests = enrichedReqs,
    err => console.error('Error loading pause requests', err)
  );
}

  loadTasks(){
    const user = this.session.getUser();
    const api = 'http://localhost:8080/api'
    if(user.role.id===1){
      let params = new HttpParams();
      params = params.set('assignedTo', user.id);

      this.http.get<any[]>(`${api}/taches`, { params })
        .subscribe(list => {
          this.tâches = list;
          this.tâches.map((tache:any)=>{
            this.labelDays=[
              ...this.labelDays,
              {date:new Date (tache.deadline), text : tache.name}
            ]
            console.log(this.labelDays)
            this.coloredDays = [
              ...this.coloredDays,
              {date:new Date (tache.deadline), highlight:"green"}
            ]
            console.log(this.coloredDays)
          })
        })
    }if(user.role.id===3){
      let params = new HttpParams();

      this.http.get<any[]>(`${api}/taches`, { params })
        .subscribe(list => {
          this.tâches = list;
          this.tâches.map((tache:any)=>{
            this.labelDays=[
              ...this.labelDays,
              {date:new Date (tache.deadline), text : tache.name}
            ]
            this.coloredDays = [
              ...this.coloredDays,
              {date:new Date (tache.deadline), highlight:"green"}
            ]
          })
        })
    }
  }
  
loadAllMeetings() {
  const user: User = this.session.getUser();

  this.meetingService.getUserMeetings(user.id!).pipe(
    switchMap((meetings: any[]) => {
      return forkJoin(
        meetings.map(meeting => {
          // Add label and color for calendar
          this.labelDays = [
        ...this.labelDays,
        { date: new Date(meeting.date), text: meeting.project?.name || 'Unknown Project' }
          ];

          this.coloredDays = [
          ...this.coloredDays,
          { date: new Date(meeting.date), highlight: 'blue' }
          ];
          this.cd.detectChanges(); // force Angular to notice changes

          // If no participants, return directly
          if (!meeting.participantsIds?.length) {
            return of({
              ...meeting,
              participants: [],
              participantNames: []
            });
          }

          // Fetch all participant users
          return forkJoin(
            meeting.participantsIds.map((id: number) => this.userService.getUserById(id))
          ).pipe(
            map(users => ({
              ...meeting,
              participants: users,
              //participantNames: users.map((u: any) => `${u.firstName} ${u.lastName}`)
            }))
          );
        })
      );
    })
  ).subscribe(
    processedMeetings => {
      this.meetings = processedMeetings;
    },
    err => console.error('Error loading meetings', err)
  );
}


  openAddMeetingDialog(): void {
    const currentUser = this.session.getUser();

    // 1) Récupère la liste des utilisateurs pour le multiselect
    this.userService.getAllUsers().subscribe(users => {
      const otherUsers = users.filter(u => u.id !== currentUser.id);

      // 2) Ouvre le dialog
      const dialogRef = this.dialog.open(MeetingDialogComponent, {
        width: '600px',
        height: '90vh',
        data: {
          allUsers: otherUsers
        }
      });

      // 3) Après fermeture, récupère le Meeting créé
      dialogRef.afterClosed().subscribe((meeting: Meeting | undefined) => {
        if (!meeting) return;

        // 4) Envoie au service : si meeting.projectId est null => scheduleNoProject
        const obs$ = meeting.projectId != null
          ? this.meetingService.schedule(meeting.projectId, meeting, currentUser.id)
          : this.meetingService.scheduleNoProject(meeting, currentUser.id);

        obs$.subscribe({
          next: () => this.loadAllMeetings(),
          error: err => console.error('Erreur planification réunion', err)
        });
      });
    });
  }


  onDayChange(event: any): void {
  // selon la version de Mobiscroll, la date peut être dans `event.date` ou dans `event.value`
  const selected: Date = event.date ?? event.value;
  this.onDateSelected(selected);
}

/**  
 * Votre méthode existante qui prend un Date  
 */
onDateSelected(date: Date | null): void {
  if (date) {
    this.selectedDate = date;
    console.log('Selected date:', this.datePipe.transform(date, 'yyyy-MM-dd'));
  }
}


  getCalendarStartDate(): Date {
    return new Date();
  }

  dateClass = (d: Date): string => {
    const ds = d.toISOString().split('T')[0];
    if (this.publicHolidays.some(h => h.date === ds)) return 'public-holiday';
    if (this.meetings.some(m => m.date === ds)) return 'has-meeting';
    return '';
  }


  private loadNotes(): void {
  this.noteSvc.findAll().subscribe({
    next: list => this.notes = list,
    error: err => console.error('Erreur chargement notes', err)
  });
}

openNoteDialog(): void {
  // Ouvrir un MatDialog pour créer ou modifier une note
  const ref = this.dialog.open(NoteDialogComponent, {
    width: '600px',
    data: {}  // passer un objet vide pour création
  });
  ref.afterClosed().subscribe(result => {
    if (result) this.loadNotes();
  });
}

viewNoteDetail(id: number): void {
  // Soit naviguer vers une page /details/:id, soit ouvrir un dialogue
  this.router.navigate(['/dashboard/notes', id]);
}
  
showAddMeetingDialog(projectId: number) {
  const currentUser = this.session.getUser();
  this.userService.getAllUsers().subscribe(users => {
    const otherUsers = users.filter(u => u.id !== currentUser.id);

    const dialogRef = this.dialog.open(MeetingDialogComponent, {
      width: '600px',
      data: {
        projectId,
        allUsers: otherUsers
      } as Partial<Meeting> // meeting data not required at creation
    });

    dialogRef.afterClosed().subscribe((meeting: Meeting | undefined) => {
      if (meeting) {
        this.meetingService.schedule(projectId, meeting, currentUser.id)
          .subscribe(() => this.loadAllMeetings());
      }
    });
  });
}

openMeetingDetails(m: Meeting): void {
  if (m.projectId) {
    this.router.navigate(['/dashboard/projects', m.projectId, 'meetings', m.id]);
  } else {
    this.router.navigate(['/dashboard/meetings', m.id]);
  }
}
}