import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordInvitestudentsComponent } from './coord-invitestudents.component';

describe('CoordInvitestudentsComponent', () => {
  let component: CoordInvitestudentsComponent;
  let fixture: ComponentFixture<CoordInvitestudentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordInvitestudentsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CoordInvitestudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
