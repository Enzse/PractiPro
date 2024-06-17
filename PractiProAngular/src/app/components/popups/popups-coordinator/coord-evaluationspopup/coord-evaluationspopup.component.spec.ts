import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordEvaluationspopupComponent } from './coord-evaluationspopup.component';

describe('CoordEvaluationspopupComponent', () => {
  let component: CoordEvaluationspopupComponent;
  let fixture: ComponentFixture<CoordEvaluationspopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordEvaluationspopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordEvaluationspopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
