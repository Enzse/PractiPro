import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeminarspopupComponent } from './seminarspopup.component';

describe('SeminarspopupComponent', () => {
  let component: SeminarspopupComponent;
  let fixture: ComponentFixture<SeminarspopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeminarspopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SeminarspopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
