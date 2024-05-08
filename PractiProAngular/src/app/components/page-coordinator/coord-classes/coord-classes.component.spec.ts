import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordClassesComponent } from './coord-classes.component';

describe('CoordClassesComponent', () => {
  let component: CoordClassesComponent;
  let fixture: ComponentFixture<CoordClassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordClassesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordClassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
