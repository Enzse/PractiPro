import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementspopupComponent } from './requirementspopup.component';

describe('RequirementspopupComponent', () => {
  let component: RequirementspopupComponent;
  let fixture: ComponentFixture<RequirementspopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequirementspopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequirementspopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
