import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskBoadComponent } from './task-boad.component';

describe('TaskBoadComponent', () => {
  let component: TaskBoadComponent;
  let fixture: ComponentFixture<TaskBoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskBoadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskBoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
