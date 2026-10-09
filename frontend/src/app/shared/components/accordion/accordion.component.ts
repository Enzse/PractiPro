
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';


@Component({
    selector: 'app-accordion',
    imports: [],
    templateUrl: './accordion.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './accordion.component.css'
})
export class AccordionComponent {
  @Input() headerText: string = '';
  @Input() addText1: string = '';
  isAccordionOpen = false;

  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }

}

