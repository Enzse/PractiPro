import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordAccomplishmentReportComponent } from './coord-accomplishment-report.component';

describe('CoordAccomplishmentReportComponent', () => {
  let component: CoordAccomplishmentReportComponent;
  let fixture: ComponentFixture<CoordAccomplishmentReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordAccomplishmentReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordAccomplishmentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
