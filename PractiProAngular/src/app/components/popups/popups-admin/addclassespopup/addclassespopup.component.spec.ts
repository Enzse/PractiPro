import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddclassespopupComponent } from './addclassespopup.component';

describe('AddclassespopupComponent', () => {
  let component: AddclassespopupComponent;
  let fixture: ComponentFixture<AddclassespopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddclassespopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddclassespopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
