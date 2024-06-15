import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpvDtrpopupComponent } from './spv-dtrpopup.component';

describe('SpvDtrpopupComponent', () => {
  let component: SpvDtrpopupComponent;
  let fixture: ComponentFixture<SpvDtrpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpvDtrpopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpvDtrpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
