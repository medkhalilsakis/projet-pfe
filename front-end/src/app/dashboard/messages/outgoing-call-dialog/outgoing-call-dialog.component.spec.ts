import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutgoingCallDialogComponent } from './outgoing-call-dialog.component';

describe('OutgoingCallDialogComponent', () => {
  let component: OutgoingCallDialogComponent;
  let fixture: ComponentFixture<OutgoingCallDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutgoingCallDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutgoingCallDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
