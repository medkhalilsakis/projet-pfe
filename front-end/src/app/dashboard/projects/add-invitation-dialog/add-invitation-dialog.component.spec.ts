import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInvitationDialogComponent } from './add-invitation-dialog.component';

describe('AddInvitationDialogComponent', () => {
  let component: AddInvitationDialogComponent;
  let fixture: ComponentFixture<AddInvitationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInvitationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInvitationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
