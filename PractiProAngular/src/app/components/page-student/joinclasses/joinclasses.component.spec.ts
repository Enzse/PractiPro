import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinclassesComponent } from './joinclasses.component';

describe('JoinclassesComponent', () => {
  let component: JoinclassesComponent;
  let fixture: ComponentFixture<JoinclassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinclassesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JoinclassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
