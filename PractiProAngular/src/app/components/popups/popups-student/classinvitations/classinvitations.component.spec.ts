import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassinvitationsComponent } from './classinvitations.component';

describe('ClassinvitationsComponent', () => {
  let component: ClassinvitationsComponent;
  let fixture: ComponentFixture<ClassinvitationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassinvitationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClassinvitationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
