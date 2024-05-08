import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCoordinatorsComponent } from './admin-coordinators.component';

describe('AdminCoordinatorsComponent', () => {
  let component: AdminCoordinatorsComponent;
  let fixture: ComponentFixture<AdminCoordinatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCoordinatorsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminCoordinatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
