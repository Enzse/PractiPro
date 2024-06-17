import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewprofilepopupComponent } from './viewprofilepopup.component';

describe('ViewprofilepopupComponent', () => {
  let component: ViewprofilepopupComponent;
  let fixture: ComponentFixture<ViewprofilepopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewprofilepopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewprofilepopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
