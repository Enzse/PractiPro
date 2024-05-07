import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditinformationpopupComponent } from './editinformationpopup.component';

describe('EditinformationpopupComponent', () => {
  let component: EditinformationpopupComponent;
  let fixture: ComponentFixture<EditinformationpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditinformationpopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditinformationpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
