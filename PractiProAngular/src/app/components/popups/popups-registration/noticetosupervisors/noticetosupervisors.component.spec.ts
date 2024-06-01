import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticetosupervisorsComponent } from './noticetosupervisors.component';

describe('NoticetosupervisorsComponent', () => {
  let component: NoticetosupervisorsComponent;
  let fixture: ComponentFixture<NoticetosupervisorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoticetosupervisorsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NoticetosupervisorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
