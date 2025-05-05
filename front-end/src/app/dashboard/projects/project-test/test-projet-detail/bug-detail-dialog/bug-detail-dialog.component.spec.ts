import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BugDetailDialogComponent } from './bug-detail-dialog.component';

describe('BugDetailDialogComponent', () => {
  let component: BugDetailDialogComponent;
  let fixture: ComponentFixture<BugDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BugDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BugDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
