import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspaceAdminstrativeComponent } from './espace-adminstrative.component';

describe('EspaceAdminstrativeComponent', () => {
  let component: EspaceAdminstrativeComponent;
  let fixture: ComponentFixture<EspaceAdminstrativeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspaceAdminstrativeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EspaceAdminstrativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
