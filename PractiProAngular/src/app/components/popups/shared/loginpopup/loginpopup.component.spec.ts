import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginpopupComponent } from './loginpopup.component';

describe('LoginpopupComponent', () => {
  let component: LoginpopupComponent;
  let fixture: ComponentFixture<LoginpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginpopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
