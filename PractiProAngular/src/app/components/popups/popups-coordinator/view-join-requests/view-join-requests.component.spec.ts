import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewJoinRequestsComponent } from './view-join-requests.component';

describe('ViewJoinRequestsComponent', () => {
  let component: ViewJoinRequestsComponent;
  let fixture: ComponentFixture<ViewJoinRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewJoinRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewJoinRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
