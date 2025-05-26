import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TestScenarioService } from '../../../../../services/test-scenario.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-test-scenario-popup',
  templateUrl: './test-scenario.component.html',
  styleUrls: ['./test-scenario.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    MatDialogModule
  ]
})
export class TestScenarioComponent implements OnInit {

  scenario: any;

  constructor(
    private testScenarioService: TestScenarioService,
    public dialogRef: MatDialogRef<TestScenarioComponent>,
    @Inject(MAT_DIALOG_DATA) public projectId: number
  ) {}

  ngOnInit(): void {
    // Charger le scénario de test via le service
    this.testScenarioService.getTestScenarioByProjectId(this.projectId).subscribe(data => {
      this.scenario = data;
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
