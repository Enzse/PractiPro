import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationadvisorComponent } from './registrationadvisor.component';

describe('RegistrationadvisorComponent', () => {
  let component: RegistrationadvisorComponent;
  let fixture: ComponentFixture<RegistrationadvisorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationadvisorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistrationadvisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
