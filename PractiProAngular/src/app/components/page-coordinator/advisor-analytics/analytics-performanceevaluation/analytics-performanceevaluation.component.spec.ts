import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsPerformanceevaluationComponent } from './analytics-performanceevaluation.component';

describe('AnalyticsPerformanceevaluationComponent', () => {
  let component: AnalyticsPerformanceevaluationComponent;
  let fixture: ComponentFixture<AnalyticsPerformanceevaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsPerformanceevaluationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnalyticsPerformanceevaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
