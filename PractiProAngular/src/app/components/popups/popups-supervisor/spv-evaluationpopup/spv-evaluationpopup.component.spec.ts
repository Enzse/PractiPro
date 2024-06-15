import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpvEvaluationpopupComponent } from './spv-evaluationpopup.component';

describe('SpvEvaluationpopupComponent', () => {
  let component: SpvEvaluationpopupComponent;
  let fixture: ComponentFixture<SpvEvaluationpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpvEvaluationpopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpvEvaluationpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
