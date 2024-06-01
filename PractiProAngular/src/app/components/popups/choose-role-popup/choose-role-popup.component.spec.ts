import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseRolePopupComponent } from './choose-role-popup.component';

describe('ChooseRolePopupComponent', () => {
  let component: ChooseRolePopupComponent;
  let fixture: ComponentFixture<ChooseRolePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseRolePopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChooseRolePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
