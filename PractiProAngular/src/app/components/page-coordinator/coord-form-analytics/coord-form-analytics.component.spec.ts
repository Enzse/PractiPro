import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordFormAnalyticsComponent } from './coord-form-analytics.component';

describe('CoordFormAnalyticsComponent', () => {
  let component: CoordFormAnalyticsComponent;
  let fixture: ComponentFixture<CoordFormAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordFormAnalyticsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordFormAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
