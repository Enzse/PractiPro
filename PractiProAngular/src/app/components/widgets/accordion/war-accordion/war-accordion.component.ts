
import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { initAccordions } from 'flowbite';


@Component({
    selector: 'app-war-accordion',
    imports: [],
    templateUrl: './war-accordion.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './war-accordion.component.css'
})
export class WarAccordionComponent implements OnInit {
  @Input() headerText: string = '';
  @Input() addText1: string = '';
  isAccordionOpen = false;

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }

  ngOnInit(): void {
    initAccordions()
  }
}

