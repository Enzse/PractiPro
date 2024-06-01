import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DtrpopupcomponentComponent } from './dtrpopupcomponent.component';

describe('DtrpopupcomponentComponent', () => {
  let component: DtrpopupcomponentComponent;
  let fixture: ComponentFixture<DtrpopupcomponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DtrpopupcomponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DtrpopupcomponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
