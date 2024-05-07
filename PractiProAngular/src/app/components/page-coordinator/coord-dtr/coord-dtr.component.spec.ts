import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordDtrComponent } from './coord-dtr.component';

describe('CoordDtrComponent', () => {
  let component: CoordDtrComponent;
  let fixture: ComponentFixture<CoordDtrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordDtrComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordDtrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
