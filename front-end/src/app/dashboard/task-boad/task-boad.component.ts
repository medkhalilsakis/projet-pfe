import { Component, EventEmitter, HostListener, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SessionStorageService } from '../../services/session-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { DeveloperDialogComponent } from './developer-dialog/developer-dialog.component';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';


enum Role {
  DEVELOPER = 1,
  TESTER = 2,
  ADMIN = 3
}

interface User {
  id: number;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  role: {
    id: number;
    libelle: string;
    description: string | null;
  };
}

interface Task {
  id: number;
  name: string;
  description: string;
  deadline: string;
  outils: string;
  creationDate: string;
  status: 'a_developper' | 'en_test' | 'suspendu'| 'cloturé' | 'terminé';
  assignedTo: User;
  assignedBy: User;
  projectDetaills:String
  TestCases:String
}

@Component({
  selector: 'app-task-boad',
  templateUrl: './task-boad.component.html',
  styleUrls: ['./task-boad.component.css'],
  imports: [
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    RouterModule,

  ],
  standalone: true
})
export class TaskBoadComponent implements OnInit {
  currentView = signal<string>('overview');
  selectedTask = signal<any>(null);

  roleId: number = 0;
  userId: number = 0;
  gridCols: number = 3;
  isLoading: boolean = false;

  currentUser: any;
  developers: User[] = [];
  testers: User[] = [];
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  
  showDevForm = false;
  showTestForm = false;
  taskForm: FormGroup;
  selectedUserId : number= 0;
  selectedRole = 0;
  statusOrder: { [key: string]: number } = {
    a_developper: 0,
    en_test: 1,
    suspendu: 2,
    terminé: 3,
    cloturé: 4
  };

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private http: HttpClient,private sessionStorage: SessionStorageService
  ) {
    this.currentUser = sessionStorage.getUser() || {};
    this.taskForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      deadline: ['', Validators.required],
      outils: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.roleId = this.currentUser.role?.id || 0;
    this.userId = this.currentUser.id || 0;
    this.updateGridCols();
    this.fetchTasks();
    
    if (this.isAdmin()) {
      this.fetchUsers();
    }
  }
  openDeveloperDialog() {
    const dialogRef = this.dialog.open(DeveloperDialogComponent, {
      width: '600px',
      height: '80vh',
      data: { developers: this.developers }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Task created:', result);
        this.fetchTasks(); // Refresh tasks after dialog closes and task is created
      }
    });
  }
  

  @HostListener('window:resize')
  updateGridCols() {
    const width = window.innerWidth;
    if (width < 600) {
      this.gridCols = 1;
    } else if (width < 960) {
      this.gridCols = 2;
    } else {
      this.gridCols = 3;
    }
  }

  fetchTasks(): void {
    this.isLoading = true;
    this.http.get<any[]>(`http://localhost:8080/api/taches`).subscribe({
      next: (data) => {
        this.tasks = data;
        this.filterTasksByRole();
        console.log(this.tasks)
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch tasks:', err);
        this.isLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'terminé':
        return 'status-terminated';
      case 'cloturé':
        return 'status-closed';
      case 'suspendu':
        return 'status-suspended';
      case 'a_developper':
        return 'status-to-develop';
      case 'en_test':
        return 'status-testing';
      default:
        return '';
    }
  }
  

  getStatus(status: string): string {
    switch (status) {
      case 'terminé':
        return 'terminé';
      case 'cloturé':
        return 'cloturé';
      case 'suspendu':
        return 'suspendu';
      case 'a_developper':
        return 'a developper';
      case 'en_test':
        return 'en test';
      default:
        return '';
    }
  }
  

  fetchUsers(): void {
    this.http.get<User[]>(`http://localhost:8080/api/users`).subscribe({
      next: (users) => {
        this.developers = users.filter(u => u.role.id === Role.DEVELOPER);
        this.testers = users.filter(u => u.role.id === Role.TESTER);
      },
      error: (err) => console.error('Failed to fetch users:', err)
    });
  }

  filterTasksByRole(): void {
    let tasksToFilter = [];
  
    if (this.roleId === Role.ADMIN) {
      tasksToFilter = this.tasks;
    } else {
      tasksToFilter = this.tasks.filter(task => task.assignedTo.id === this.userId);
    }
  
    this.filteredTasks = tasksToFilter.sort((a, b) =>
      this.statusOrder[a.status] - this.statusOrder[b.status]
    );
  }
  isdeveloper(): boolean {
    return this.roleId === Role.DEVELOPER;
  }
  isAdmin(): boolean {
    return this.roleId === Role.ADMIN;
  }

  showAssignForm(role: number, userId: number): void {
    this.selectedRole = role;
    this.selectedUserId = userId;
    this.taskForm.reset();
    this.showDevForm = role === Role.DEVELOPER;
    this.showTestForm = role === Role.TESTER;
  }

  createTask(): void {
    if (this.taskForm.invalid) {
      return;
    }

    const newTask = {
      ...this.taskForm.value,
      Deadline: new Date(this.taskForm.value.deadline).toISOString().split('T')[0],
      creationDate: new Date().toISOString().split('T')[0],
      assignedTo: this.selectedUserId,
      assignedBy: this.sessionStorage.getUser().id,
      status: 'a_developper'
    };

    this.http.post(`http://localhost:8080/api/taches/create`, newTask)
    .subscribe({
      next: () => {
        this.fetchTasks();
        this.showDevForm = false;
        this.showTestForm = false;
      },
      error: (err) => console.log('Failed to create task:', err)
    });
  }

  updateTaskStatus(taskId: number, newStatus: string): void {
    this.http.put(`http://localhost:8080/api/taches/update/${taskId}`, { status: newStatus })
      .subscribe({
        next: () => this.fetchTasks(),
        error: (err) => console.error('Failed to update task:', err)
      });
  }
  
  @Output() taskSelected = new EventEmitter<any>();

  viewTaskDetails(task: any) {
  this.taskSelected.emit(task);
}



  
  


}