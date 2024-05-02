import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyAccomplishmentRepComponent } from './weekly-accomplishment-rep.component';

describe('WeeklyAccomplishmentRepComponent', () => {
  let component: WeeklyAccomplishmentRepComponent;
  let fixture: ComponentFixture<WeeklyAccomplishmentRepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyAccomplishmentRepComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WeeklyAccomplishmentRepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
