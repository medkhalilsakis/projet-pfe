import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-complaint-details',
  templateUrl: './complaint-details.component.html',
  styleUrls: ['./complaint-details.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    MatInputModule,
    MatDialogModule
  ]
})
export class ComplaintDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<ComplaintDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { details: string, date: string }
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
