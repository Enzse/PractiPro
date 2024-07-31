import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { AuthService } from '../../../services/auth.service';
import { Subscription, map } from 'rxjs';
import { BlockService } from '../../../services/block.service';

@Component({
  selector: 'app-advisor-analytics',
  standalone: true,
  imports: [ChartModule, CommonModule],
  templateUrl: './advisor-analytics.component.html',
  styleUrl: './advisor-analytics.component.css'
})
export class AdvisorAnalyticsComponent implements OnInit, OnDestroy {
  studentlist: any[] = [];
  data: any;
  private subscriptions = new Subscription();
  finalReportsData: any;
  options2 = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    aspectRatio: 2.5,
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          color: "#000000",
        }
      }
    }
  };

  options = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    aspectRatio: 1.5,
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


  p1q1: any;
  p1q2: any;
  p1q3: any;
  p1q4: any;
  p1q5: any;
  p1q6: any;
  p1q7: any;
  p1q7x1: any;

  p2x1: any;
  p3q1: any;

  currentBlock: any;
  constructor(private service: AuthService, private blockService: BlockService) {
  }

  ngOnInit() {
    this.subscriptions.add(
      this.blockService.selectedBlock$.pipe(
        map((res: any) => res)
      ).subscribe((res: any) => {
        this.currentBlock = res;
        this.getFinalReportsAnalytics(this.currentBlock);
      })
    )
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getFinalReportsAnalytics(block: any) {
    this.subscriptions.add(
      this.service.getFinalReportsAnalytics(block).subscribe((res: any) => {
        this.finalReportsData = res.payload[0];
        console.log(this.finalReportsData)


        const labelsYesNo = ["Yes", "No"]
        const backgroundColor = ["#fc5c1c", "#1e3a8a"]
        this.p1q1 = {
          labels: labelsYesNo,
          datasets: [
            {
              data: [this.finalReportsData.p1q1_yes_count, this.finalReportsData.p1q1_no_count,],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p1q2 = {
          labels: labelsYesNo,
          datasets: [
            {
              data: [this.finalReportsData.p1q2_yes_count, this.finalReportsData.p1q2_no_count,],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p1q3 = {
          labels: labelsYesNo,
          datasets: [
            {
              data: [this.finalReportsData.p1q3_yes_count, this.finalReportsData.p1q3_no_count,],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p1q4 = {
          labels: labelsYesNo,
          datasets: [
            {
              data: [this.finalReportsData.p1q4_yes_count, this.finalReportsData.p1q4_no_count,],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p1q5 = {
          labels: labelsYesNo,
          datasets: [
            {
              data: [this.finalReportsData.p1q5_yes_count, this.finalReportsData.p1q5_no_count,],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p1q6 = {
          labels: labelsYesNo,
          datasets: [
            {
              data: [this.finalReportsData.p1q6_yes_count, this.finalReportsData.p1q6_no_count,],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p1q7 = {
          labels: labelsYesNo,
          datasets: [
            {
              data: [this.finalReportsData.p1q7_yes_count, this.finalReportsData.p1q7_no_count,],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p1q7x1 = {
          labels: ["Meal", "Cash", "None"],
          datasets: [
            {
              data: [this.finalReportsData.p1q7x1_meal_count, this.finalReportsData.p1q7x1_cash_count, this.finalReportsData.p1q7x1_null_count],
              hidden: false,
              backgroundColor: ["#fc5c1c", "#1e3a8a", "gray"]
            },
          ]
        };

        this.p2x1 = {
          labels: ["100%", "75%", "50%", "25%", "0%"],
          datasets: [
            {
              label: "Student Training Objectives",
              data: [this.finalReportsData.p2x1_100, this.finalReportsData.p2x1_75, this.finalReportsData.p2x1_50, this.finalReportsData.p2x1_25, this.finalReportsData.p2x1_0],
              hidden: false,
              backgroundColor: ["#fc5c1c"]
            },
          ]
        };

        this.p3q1 = {
          labels: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
          datasets: [
            {
              label: 'Student OJT Performance',
              data: [this.finalReportsData.p3q1_excellent, this.finalReportsData.p3q1_verygood, this.finalReportsData.p3q1_good, this.finalReportsData.p3q1_fair, this.finalReportsData.p3q1_poor],
              hidden: false,
              backgroundColor: "#fc5c1c"
            },
          ]
        };

      })
    )
  }

}
