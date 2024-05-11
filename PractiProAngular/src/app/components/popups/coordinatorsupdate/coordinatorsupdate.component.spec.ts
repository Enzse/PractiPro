import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinatorsupdateComponent } from './coordinatorsupdate.component';

describe('CoordinatorsupdateComponent', () => {
  let component: CoordinatorsupdateComponent;
  let fixture: ComponentFixture<CoordinatorsupdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordinatorsupdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordinatorsupdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
