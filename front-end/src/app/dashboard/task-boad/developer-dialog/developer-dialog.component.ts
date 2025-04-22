import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SessionStorageService } from '../../../services/session-storage.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';

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
}

@Component({
  selector: 'app-developer-dialog',
  imports: [
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FormsModule,
    MatListModule
  ],
  templateUrl: './developer-dialog.component.html',
  styleUrl: './developer-dialog.component.css'
})
export class DeveloperDialogComponent implements OnInit {
  projectDetailsFile: File | null = null;
  testCasesFile: File | null = null;


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

  selectedDeveloper: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private sessionStorage: SessionStorageService,
    private http: HttpClient,
    private dialogRef: MatDialogRef<DeveloperDialogComponent>
  ) {
    this.developers = data.developers;
    this.taskForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      deadline: ['', Validators.required],
      outils: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      deadline: ['', Validators.required],
      outils: ['', Validators.required],
    });
    
  }
  onDeveloperSelectionChange(event: any): void {
    const selected = event.options[0].value;
    if (selected) {
      this.selectedUserId = selected.id;
      this.selectedRole = Role.DEVELOPER;
      this.showDevForm = true;
      this.showTestForm = false;
      this.taskForm.reset();
    }
  }
  onFileChange(event: any, type: 'project' | 'testCases'): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (type === 'project') {
        this.projectDetailsFile = file;
      } else if (type === 'testCases') {
        this.testCasesFile = file;
      }
    } else {
      alert('Please select a valid PDF file.');
    }
  }

  createTask(): void {
    if (this.taskForm.invalid || !this.projectDetailsFile || !this.testCasesFile) {
      alert('Please complete the form and upload both PDF files.');
      return;
    }
  
    const formData = new FormData();
    
    const task = {
      ...this.taskForm.value,
      deadline: new Date(this.taskForm.value.deadline).toISOString().split('T')[0],
      creationDate: new Date().toISOString().split('T')[0],
      assignedTo: this.selectedUserId,
      assignedBy: this.sessionStorage.getUser().id,
      status: 'a_developper'
    };
  
    formData.append('task', new Blob([JSON.stringify(task)], { type: 'application/json' }));
    formData.append('projectDetails', this.projectDetailsFile);
    formData.append('testCases', this.testCasesFile);
  
    this.http.post(`http://localhost:8080/api/taches/create`, formData)
      .subscribe({
        next: () => {
          this.showDevForm = false;
          this.dialogRef.close();
        },
        error: (err) => console.error('Failed to create task with files:', err)
      });
  }
  

}
