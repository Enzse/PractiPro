import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditjobpopupComponent } from './editjobpopup.component';

describe('EditjobpopupComponent', () => {
  let component: EditjobpopupComponent;
  let fixture: ComponentFixture<EditjobpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditjobpopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditjobpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
