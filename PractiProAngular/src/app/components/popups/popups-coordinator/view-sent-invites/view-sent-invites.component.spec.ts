import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSentInvitesComponent } from './view-sent-invites.component';

describe('ViewSentInvitesComponent', () => {
  let component: ViewSentInvitesComponent;
  let fixture: ComponentFixture<ViewSentInvitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSentInvitesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewSentInvitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
