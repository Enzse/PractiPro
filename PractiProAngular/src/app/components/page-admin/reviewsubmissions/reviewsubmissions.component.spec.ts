import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewsubmissionsComponent } from './reviewsubmissions.component';

describe('ReviewsubmissionsComponent', () => {
  let component: ReviewsubmissionsComponent;
  let fixture: ComponentFixture<ReviewsubmissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewsubmissionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReviewsubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
