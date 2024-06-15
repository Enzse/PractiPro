import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpvWarpopupComponent } from './spv-warpopup.component';

describe('SpvWarpopupComponent', () => {
  let component: SpvWarpopupComponent;
  let fixture: ComponentFixture<SpvWarpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpvWarpopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpvWarpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
