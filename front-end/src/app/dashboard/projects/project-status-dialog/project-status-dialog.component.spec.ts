import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectStatusDialogComponent } from './project-status-dialog.component';

describe('ProjectStatusDialogComponent', () => {
  let component: ProjectStatusDialogComponent;
  let fixture: ComponentFixture<ProjectStatusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectStatusDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectStatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
