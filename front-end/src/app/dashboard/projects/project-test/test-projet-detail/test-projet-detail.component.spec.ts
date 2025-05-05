import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestProjetDetailComponent } from './test-projet-detail.component';

describe('TestProjetDetailComponent', () => {
  let component: TestProjetDetailComponent;
  let fixture: ComponentFixture<TestProjetDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestProjetDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestProjetDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
