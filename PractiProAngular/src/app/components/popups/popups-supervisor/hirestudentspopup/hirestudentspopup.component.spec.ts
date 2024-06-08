import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HirestudentspopupComponent } from './hirestudentspopup.component';

describe('HirestudentspopupComponent', () => {
  let component: HirestudentspopupComponent;
  let fixture: ComponentFixture<HirestudentspopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HirestudentspopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HirestudentspopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
