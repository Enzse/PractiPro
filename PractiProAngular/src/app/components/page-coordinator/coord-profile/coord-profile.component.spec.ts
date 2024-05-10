import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordProfileComponent } from './coord-profile.component';

describe('CoordProfileComponent', () => {
  let component: CoordProfileComponent;
  let fixture: ComponentFixture<CoordProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
