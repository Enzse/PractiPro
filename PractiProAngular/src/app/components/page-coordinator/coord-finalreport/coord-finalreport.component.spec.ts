import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordFinalreportComponent } from './coord-finalreport.component';

describe('CoordFinalreportComponent', () => {
  let component: CoordFinalreportComponent;
  let fixture: ComponentFixture<CoordFinalreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordFinalreportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordFinalreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
