import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddcertificatepopupComponent } from './addcertificatepopup.component';

describe('AddcertificatepopupComponent', () => {
  let component: AddcertificatepopupComponent;
  let fixture: ComponentFixture<AddcertificatepopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddcertificatepopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddcertificatepopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
