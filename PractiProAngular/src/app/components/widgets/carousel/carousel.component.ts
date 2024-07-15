import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { initCarousels } from 'flowbite';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})
export class CarouselComponent implements OnInit {

  //   @Input() slides: number = 0;

  ngOnInit(): void {
    initCarousels();
  }
}
