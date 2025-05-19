import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTermineComponent } from './project-termine.component';

describe('ProjectTermineComponent', () => {
  let component: ProjectTermineComponent;
  let fixture: ComponentFixture<ProjectTermineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTermineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTermineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
