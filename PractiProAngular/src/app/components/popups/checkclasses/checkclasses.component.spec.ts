import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckclassesComponent } from './checkclasses.component';

describe('CheckclassesComponent', () => {
  let component: CheckclassesComponent;
  let fixture: ComponentFixture<CheckclassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckclassesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CheckclassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
