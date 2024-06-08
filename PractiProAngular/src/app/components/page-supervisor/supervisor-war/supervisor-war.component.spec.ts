import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisorWarComponent } from './supervisor-war.component';

describe('SupervisorWarComponent', () => {
  let component: SupervisorWarComponent;
  let fixture: ComponentFixture<SupervisorWarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupervisorWarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupervisorWarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
