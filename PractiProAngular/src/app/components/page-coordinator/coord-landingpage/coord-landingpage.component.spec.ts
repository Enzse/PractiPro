import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordLandingpageComponent } from './coord-landingpage.component';

describe('CoordLandingpageComponent', () => {
  let component: CoordLandingpageComponent;
  let fixture: ComponentFixture<CoordLandingpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordLandingpageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordLandingpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
