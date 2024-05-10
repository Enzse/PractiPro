import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarpopupcomponentComponent } from './warpopupcomponent.component';

describe('WarpopupcomponentComponent', () => {
  let component: WarpopupcomponentComponent;
  let fixture: ComponentFixture<WarpopupcomponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarpopupcomponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WarpopupcomponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
