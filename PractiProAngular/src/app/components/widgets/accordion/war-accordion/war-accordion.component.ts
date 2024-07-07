import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { initAccordions } from 'flowbite';


@Component({
  selector: 'app-war-accordion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './war-accordion.component.html',
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

