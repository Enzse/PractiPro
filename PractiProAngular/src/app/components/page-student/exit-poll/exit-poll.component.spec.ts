import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitPollComponent } from './exit-poll.component';

describe('ExitPollComponent', () => {
  let component: ExitPollComponent;
  let fixture: ComponentFixture<ExitPollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExitPollComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExitPollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
