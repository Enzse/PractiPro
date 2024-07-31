import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvisorAnalyticsComponent } from './advisor-analytics.component';

describe('AdvisorAnalyticsComponent', () => {
  let component: AdvisorAnalyticsComponent;
  let fixture: ComponentFixture<AdvisorAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvisorAnalyticsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdvisorAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
