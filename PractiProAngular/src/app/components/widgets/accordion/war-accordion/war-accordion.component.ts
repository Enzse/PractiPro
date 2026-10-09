
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';


@Component({
    selector: 'app-war-accordion',
    imports: [],
    templateUrl: './war-accordion.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './war-accordion.component.css'
})
export class WarAccordionComponent {
  @Input() headerText: string = '';
  @Input() addText1: string = '';
  isAccordionOpen = false;

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }

}

