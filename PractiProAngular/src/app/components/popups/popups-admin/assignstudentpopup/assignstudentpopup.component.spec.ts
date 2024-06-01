import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignstudentpopupComponent } from './assignstudentpopup.component';

describe('AssignstudentpopupComponent', () => {
  let component: AssignstudentpopupComponent;
  let fixture: ComponentFixture<AssignstudentpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignstudentpopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignstudentpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
