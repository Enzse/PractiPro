import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordDashboardComponent } from './coord-dashboard.component';

describe('CoordDashboardComponent', () => {
  let component: CoordDashboardComponent;
  let fixture: ComponentFixture<CoordDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
