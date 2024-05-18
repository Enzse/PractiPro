import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectstudentspopupComponent } from './selectstudentspopup.component';

describe('SelectstudentspopupComponent', () => {
  let component: SelectstudentspopupComponent;
  let fixture: ComponentFixture<SelectstudentspopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectstudentspopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectstudentspopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
