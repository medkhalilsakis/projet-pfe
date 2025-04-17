import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametresProjetComponent } from './parametres-projet.component';

describe('ParametresProjetComponent', () => {
  let component: ParametresProjetComponent;
  let fixture: ComponentFixture<ParametresProjetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParametresProjetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParametresProjetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
