import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewhiringrequestsComponent } from './viewhiringrequests.component';

describe('ViewhiringrequestsComponent', () => {
  let component: ViewhiringrequestsComponent;
  let fixture: ComponentFixture<ViewhiringrequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewhiringrequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewhiringrequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
