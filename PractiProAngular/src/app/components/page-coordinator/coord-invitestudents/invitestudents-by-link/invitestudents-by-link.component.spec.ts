import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitestudentsByLinkComponent } from './invitestudents-by-link.component';

describe('InvitestudentsByLinkComponent', () => {
  let component: InvitestudentsByLinkComponent;
  let fixture: ComponentFixture<InvitestudentsByLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitestudentsByLinkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InvitestudentsByLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
