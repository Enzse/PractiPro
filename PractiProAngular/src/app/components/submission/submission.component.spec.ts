import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmissionComponent } from './submission.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('SubmissionComponent', () => {
  let component: SubmissionComponent;
  let fixture: ComponentFixture<SubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionComponent, FormsModule, CommonModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
