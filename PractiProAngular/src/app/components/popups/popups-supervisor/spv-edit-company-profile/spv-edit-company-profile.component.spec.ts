import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpvEditCompanyProfileComponent } from './spv-edit-company-profile.component';

describe('SpvEditCompanyProfileComponent', () => {
  let component: SpvEditCompanyProfileComponent;
  let fixture: ComponentFixture<SpvEditCompanyProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpvEditCompanyProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpvEditCompanyProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
