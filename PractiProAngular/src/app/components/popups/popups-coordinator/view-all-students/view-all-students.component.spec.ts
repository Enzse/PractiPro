import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllStudentsComponent } from './view-all-students.component';

describe('ViewAllStudentsComponent', () => {
  let component: ViewAllStudentsComponent;
  let fixture: ComponentFixture<ViewAllStudentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllStudentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAllStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
