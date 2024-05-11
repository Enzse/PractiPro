import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassesStudentpopupComponent } from './classes-studentpopup.component';

describe('ClassesStudentpopupComponent', () => {
  let component: ClassesStudentpopupComponent;
  let fixture: ComponentFixture<ClassesStudentpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassesStudentpopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClassesStudentpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
