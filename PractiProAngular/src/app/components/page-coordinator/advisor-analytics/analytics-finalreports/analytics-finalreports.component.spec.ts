import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsFinalreportsComponent } from './analytics-finalreports.component';

describe('AnalyticsFinalreportsComponent', () => {
  let component: AnalyticsFinalreportsComponent;
  let fixture: ComponentFixture<AnalyticsFinalreportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsFinalreportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnalyticsFinalreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
