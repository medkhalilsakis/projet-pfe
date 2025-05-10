import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifcationDetailComponent } from './notifcation-detail.component';

describe('NotifcationDetailComponent', () => {
  let component: NotifcationDetailComponent;
  let fixture: ComponentFixture<NotifcationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotifcationDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotifcationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
