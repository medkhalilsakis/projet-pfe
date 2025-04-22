import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule to enable date pipe
import { MatButtonModule } from '@angular/material/button'; // Assuming you want to use mat-button
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SessionStorageService } from '../../../services/session-storage.service';
import { Router, RouterModule } from '@angular/router';

enum Role {
  DEVELOPER = 1,
  TESTER = 2,
  ADMIN = 3
}


@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule,    RouterModule ], // Add CommonModule for date pipe and other common features
  templateUrl: './task-detail.component.html',

  styleUrls: ['./task-detail.component.css'] // Fixed styleUrl to styleUrls
})
export class TaskDetailComponent {
  currentUser: any;
  constructor(private sanitizer: DomSanitizer, private http: HttpClient,private sessionStorage: SessionStorageService,  private router: Router  ) {
    this.currentUser = sessionStorage.getUser() || {};

  }

sanitizeUrl(url: string): SafeResourceUrl {
  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}
ngOnInit(): void {
  this.roleId = this.currentUser.role?.id || 0;
}
downloadError: string | null = null;

  @Input() task: any;
  
  @Input() roleId: Role = Role.DEVELOPER; // or default to ADMIN depending on app

  @Output() back = new EventEmitter<void>();
  isdeveloper(): boolean {
    return this.roleId === Role.DEVELOPER;
  }
  isAdmin(): boolean {
    return this.roleId === Role.ADMIN;
  }
  getFullUrl(relativePath: string): string {
    const cleanedPath = relativePath.replace(/\\/g, '/');
    return cleanedPath.endsWith('.pdf')
      ? `http://localhost:8080/${cleanedPath}`
      : `http://localhost:8080/${cleanedPath}.pdf`;
  }

  downloadFile(filePath: string) {
    let normalizedPath = filePath.replace(/^uploads[\\/]/, '');
    normalizedPath=normalizedPath+".pdf";

    const downloadUrl = `http://localhost:8080/api/taches/download?filePath=${encodeURIComponent(normalizedPath)}`;
    
    // Create a hidden anchor tag to trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.download = normalizedPath.split('/').pop() || 'download.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
@Output() Selected = new EventEmitter<any>();

GoToUpload(task: any) {
  this.Selected.emit(task);
}


}