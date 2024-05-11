import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeptpopupComponent } from './deptpopup.component';

describe('DeptpopupComponent', () => {
  let component: DeptpopupComponent;
  let fixture: ComponentFixture<DeptpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeptpopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeptpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
