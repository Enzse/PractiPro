import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelecttraineespopupComponent } from './selecttraineespopup.component';

describe('SelecttraineespopupComponent', () => {
  let component: SelecttraineespopupComponent;
  let fixture: ComponentFixture<SelecttraineespopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelecttraineespopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelecttraineespopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
