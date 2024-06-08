import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewtraineepopupComponent } from './viewtraineepopup.component';

describe('ViewtraineepopupComponent', () => {
  let component: ViewtraineepopupComponent;
  let fixture: ComponentFixture<ViewtraineepopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewtraineepopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewtraineepopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
