import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerWarComponent } from './answer-war.component';

describe('AnswerWarComponent', () => {
  let component: AnswerWarComponent;
  let fixture: ComponentFixture<AnswerWarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnswerWarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnswerWarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
