import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectprofilepopupComponent } from './inspectprofilepopup.component';

describe('InspectprofilepopupComponent', () => {
  let component: InspectprofilepopupComponent;
  let fixture: ComponentFixture<InspectprofilepopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectprofilepopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InspectprofilepopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
