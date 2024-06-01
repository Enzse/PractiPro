import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationsupervisorComponent } from './registrationsupervisor.component';

describe('RegistrationsupervisorComponent', () => {
  let component: RegistrationsupervisorComponent;
  let fixture: ComponentFixture<RegistrationsupervisorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationsupervisorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistrationsupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
