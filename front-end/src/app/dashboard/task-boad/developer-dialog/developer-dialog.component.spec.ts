import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperDialogComponent } from './developer-dialog.component';

describe('DeveloperDialogComponent', () => {
  let component: DeveloperDialogComponent;
  let fixture: ComponentFixture<DeveloperDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeveloperDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeveloperDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
