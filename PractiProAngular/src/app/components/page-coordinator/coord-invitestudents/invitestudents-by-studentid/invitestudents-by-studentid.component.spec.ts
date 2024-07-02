import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitestudentsByStudentidComponent } from './invitestudents-by-studentid.component';

describe('InvitestudentsByStudentidComponent', () => {
  let component: InvitestudentsByStudentidComponent;
  let fixture: ComponentFixture<InvitestudentsByStudentidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitestudentsByStudentidComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InvitestudentsByStudentidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
