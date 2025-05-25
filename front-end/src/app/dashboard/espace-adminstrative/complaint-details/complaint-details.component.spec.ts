import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintDetailsComponent } from './complaint-details.component';

describe('ComplaintDetailsComponent', () => {
  let component: ComplaintDetailsComponent;
  let fixture: ComponentFixture<ComplaintDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplaintDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
