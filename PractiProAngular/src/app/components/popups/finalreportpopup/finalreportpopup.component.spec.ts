import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalreportpopupComponent } from './finalreportpopup.component';

describe('FinalreportpopupComponent', () => {
  let component: FinalreportpopupComponent;
  let fixture: ComponentFixture<FinalreportpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalreportpopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinalreportpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
