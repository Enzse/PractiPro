import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordNavbarComponent } from './coord-navbar.component';

describe('CoordNavbarComponent', () => {
  let component: CoordNavbarComponent;
  let fixture: ComponentFixture<CoordNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordNavbarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
