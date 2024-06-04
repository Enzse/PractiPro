import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisorProfileComponent } from './supervisor-profile.component';

describe('SupervisorProfileComponent', () => {
  let component: SupervisorProfileComponent;
  let fixture: ComponentFixture<SupervisorProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupervisorProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupervisorProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
