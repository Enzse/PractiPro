import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStudentsPendingsubmissionsComponent } from './view-students-pendingsubmissions.component';

describe('ViewStudentsPendingsubmissionsComponent', () => {
  let component: ViewStudentsPendingsubmissionsComponent;
  let fixture: ComponentFixture<ViewStudentsPendingsubmissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewStudentsPendingsubmissionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewStudentsPendingsubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
