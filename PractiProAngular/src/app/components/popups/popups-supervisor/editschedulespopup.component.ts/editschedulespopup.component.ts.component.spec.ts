import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditschedulespopupComponent } from './editschedulespopup.component.ts.component';

describe('EditschedulespopupComponent', () => {
  let component: EditschedulespopupComponent;
  let fixture: ComponentFixture<EditschedulespopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditschedulespopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditschedulespopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
