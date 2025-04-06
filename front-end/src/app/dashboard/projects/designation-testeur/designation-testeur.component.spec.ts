import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignationTesteurComponent } from './designation-testeur.component';

describe('DesignationTesteurComponent', () => {
  let component: DesignationTesteurComponent;
  let fixture: ComponentFixture<DesignationTesteurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignationTesteurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignationTesteurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
