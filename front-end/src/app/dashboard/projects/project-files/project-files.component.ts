import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FileEditorComponent } from "../file-editor/file-editor.component";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface ProjectFile {
  id: number;
  name: string;
  type: 'file' | 'folder';
}

@Component({
  selector: 'app-project-files',
  standalone: true,
  templateUrl: './project-files.component.html',
  styleUrls: ['./project-files.component.css'],
  imports: [CommonModule,MatIconModule, FileEditorComponent],
})
export class ProjectFilesComponent implements OnInit {
  @Input() project!: { id: number };
  files: ProjectFile[] = [];
  selectedFile: ProjectFile | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<ProjectFile[]>(`/api/project-files?projectId=${this.project.id}`).subscribe(data => {
      this.files = data;
    });
  }

  openFile(file: ProjectFile) {
    if (file.type === 'file') {
      this.selectedFile = file;
    }
  }
}
