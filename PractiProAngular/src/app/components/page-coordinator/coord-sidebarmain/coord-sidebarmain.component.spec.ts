import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordSidebarmainComponent } from './coord-sidebarmain.component';

describe('CoordSidebarmainComponent', () => {
  let component: CoordSidebarmainComponent;
  let fixture: ComponentFixture<CoordSidebarmainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordSidebarmainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordSidebarmainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
