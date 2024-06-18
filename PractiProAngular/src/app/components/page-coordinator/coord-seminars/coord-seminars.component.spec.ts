import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordSeminarsComponent } from './coord-seminars.component';

describe('CoordSeminarsComponent', () => {
  let component: CoordSeminarsComponent;
  let fixture: ComponentFixture<CoordSeminarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordSeminarsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordSeminarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
