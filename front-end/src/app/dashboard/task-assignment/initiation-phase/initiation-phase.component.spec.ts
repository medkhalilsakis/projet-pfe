import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiationPhaseComponent } from './initiation-phase.component';

describe('InitiationPhaseComponent', () => {
  let component: InitiationPhaseComponent;
  let fixture: ComponentFixture<InitiationPhaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitiationPhaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitiationPhaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
