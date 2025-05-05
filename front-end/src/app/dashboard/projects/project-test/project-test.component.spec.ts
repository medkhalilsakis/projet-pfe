import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTestComponent } from './project-test.component';

describe('ProjectTestComponent', () => {
  let component: ProjectTestComponent;
  let fixture: ComponentFixture<ProjectTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
