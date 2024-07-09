import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-answer-finalreport',
  standalone: true,
  imports: [],
  templateUrl: './answer-finalreport.component.html',
  styleUrl: './answer-finalreport.component.css'
})
export class AnswerFinalreportComponent implements OnInit, OnDestroy {

  private subscriptions = new Subscription();
  ngOnInit(): void {

  }
  ngOnDestroy(): void {

  }
}
