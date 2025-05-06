import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PauseRequestDialogComponent } from './pause-request-dialog.component';

describe('PauseRequestDialogComponent', () => {
  let component: PauseRequestDialogComponent;
  let fixture: ComponentFixture<PauseRequestDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PauseRequestDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PauseRequestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
