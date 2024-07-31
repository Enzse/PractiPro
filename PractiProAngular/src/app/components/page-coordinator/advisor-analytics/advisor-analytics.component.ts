import { CommonModule } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-advisor-analytics',
  standalone: true,
  imports: [ChartModule, CommonModule],
  templateUrl: './advisor-analytics.component.html',
  styleUrl: './advisor-analytics.component.css'
})
export class AdvisorAnalyticsComponent {



  studentlist: any[] = [];

  data: any;

  options: any;

  ngOnInit() {


    this.data = {
      labels: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
      datasets: [
        {
          label: 'Student OJT Performance',
          /* replace these data with the count of ojt student according to their performances(overall performance count) */
          /* arrangement starts from excellent */
          data: [2, 5, 9, 2, 1],
          hidden: false,
          backgroundColor: "#fc5c1c"
        },
      ]
    };

    this.options = {
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: "#000000",
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: "#000000",
            font: {
              weight: 500
            }
          },
          grid: {
            color: 'rgb(148 163 184)',
            drawBorder: true,
            z: -1
          }
        },
        y: {
          ticks: {
            color: "#000000"
          },
          grid: {
            color: 'rgb(148 163 184)',
            drawBorder: true,
            z: -1
          }
        }
      }
    };

  }
}
