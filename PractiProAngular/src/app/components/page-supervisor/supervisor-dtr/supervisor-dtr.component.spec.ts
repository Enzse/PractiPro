import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisorDtrComponent } from './supervisor-dtr.component';

describe('SupervisorDtrComponent', () => {
  let component: SupervisorDtrComponent;
  let fixture: ComponentFixture<SupervisorDtrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupervisorDtrComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupervisorDtrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
