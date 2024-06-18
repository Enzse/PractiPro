import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionSeminarsComponent } from './submission-seminars.component';

describe('SubmissionSeminarsComponent', () => {
  let component: SubmissionSeminarsComponent;
  let fixture: ComponentFixture<SubmissionSeminarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionSeminarsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubmissionSeminarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
