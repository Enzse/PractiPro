import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisorSidebarComponent } from './supervisor-sidebar.component';

describe('SupervisorSidebarComponent', () => {
  let component: SupervisorSidebarComponent;
  let fixture: ComponentFixture<SupervisorSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupervisorSidebarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupervisorSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
