import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssigncoordpopupComponent } from './assigncoordpopup.component';

describe('AssigncoordpopupComponent', () => {
  let component: AssigncoordpopupComponent;
  let fixture: ComponentFixture<AssigncoordpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssigncoordpopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssigncoordpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
