import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordEvaluationsComponent } from './coord-evaluations.component';

describe('CoordEvaluationsComponent', () => {
  let component: CoordEvaluationsComponent;
  let fixture: ComponentFixture<CoordEvaluationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordEvaluationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordEvaluationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
