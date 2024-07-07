import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { initAccordions } from 'flowbite';


@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.css'
})
export class AccordionComponent implements OnInit {

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
