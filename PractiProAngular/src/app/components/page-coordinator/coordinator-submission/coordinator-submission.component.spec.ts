import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinatorSubmissionComponent } from './coordinator-submission.component';

describe('CoordinatorSubmissionComponent', () => {
  let component: CoordinatorSubmissionComponent;
  let fixture: ComponentFixture<CoordinatorSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordinatorSubmissionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordinatorSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
