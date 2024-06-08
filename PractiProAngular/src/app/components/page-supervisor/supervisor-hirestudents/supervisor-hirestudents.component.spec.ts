import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisorHirestudentsComponent } from './supervisor-hirestudents.component';

describe('SupervisorHirestudentsComponent', () => {
  let component: SupervisorHirestudentsComponent;
  let fixture: ComponentFixture<SupervisorHirestudentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupervisorHirestudentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupervisorHirestudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
