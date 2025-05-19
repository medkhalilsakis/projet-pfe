import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectInProgressComponent } from './project-in-progress.component';

describe('ProjectInProgressComponent', () => {
  let component: ProjectInProgressComponent;
  let fixture: ComponentFixture<ProjectInProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectInProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectInProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
