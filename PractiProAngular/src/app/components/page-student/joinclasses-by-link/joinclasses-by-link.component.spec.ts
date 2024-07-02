import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinclassesByLinkComponent } from './joinclasses-by-link.component';

describe('JoinclassesByLinkComponent', () => {
  let component: JoinclassesByLinkComponent;
  let fixture: ComponentFixture<JoinclassesByLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinclassesByLinkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JoinclassesByLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
