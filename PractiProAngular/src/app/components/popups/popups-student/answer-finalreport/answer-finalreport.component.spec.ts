import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerFinalreportComponent } from './answer-finalreport.component';

describe('AnswerFinalreportComponent', () => {
  let component: AnswerFinalreportComponent;
  let fixture: ComponentFixture<AnswerFinalreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnswerFinalreportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnswerFinalreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
