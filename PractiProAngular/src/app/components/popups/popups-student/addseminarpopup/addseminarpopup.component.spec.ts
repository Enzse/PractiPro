import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddseminarpopupComponent } from './addseminarpopup.component';

describe('AddseminarpopupComponent', () => {
  let component: AddseminarpopupComponent;
  let fixture: ComponentFixture<AddseminarpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddseminarpopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddseminarpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
