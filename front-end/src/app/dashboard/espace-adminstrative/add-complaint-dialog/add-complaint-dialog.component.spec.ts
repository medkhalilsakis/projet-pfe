import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddComplaintDialogComponent } from './add-complaint-dialog.component';

describe('AddComplaintDialogComponent', () => {
  let component: AddComplaintDialogComponent;
  let fixture: ComponentFixture<AddComplaintDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddComplaintDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddComplaintDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
