import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationadminComponent } from './registrationadmin.component';

describe('RegistrationadminComponent', () => {
  let component: RegistrationadminComponent;
  let fixture: ComponentFixture<RegistrationadminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationadminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistrationadminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
