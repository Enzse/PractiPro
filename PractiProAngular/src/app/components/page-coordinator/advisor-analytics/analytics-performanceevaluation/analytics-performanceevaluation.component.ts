import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { AuthService } from '../../../../services/auth.service';
import { Subscription, map } from 'rxjs';
import { BlockService } from '../../../../services/block.service';

@Component({
  selector: 'app-analytics-performanceevaluation',
  standalone: true,
  imports: [ChartModule, CommonModule],
  templateUrl: './analytics-performanceevaluation.component.html',
  styleUrl: './analytics-performanceevaluation.component.css'
})
export class AnalyticsPerformanceevaluationComponent implements OnInit, OnDestroy {
  studentlist: any[] = [];
  data: any;
  private subscriptions = new Subscription();
  responseData: any;
  options2 = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2.5,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          color: "#000000",
        }
      }
    }
  };

  options3 = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 3.5,
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

  p2q1: any;
  p2q2: any;
  p2q3: any;
  p2q4: any;
  p2q5: any;
  p2q6: any;
  p2q7: any;
  p2q8: any;

  p3q1: any;
  p3q2: any;
  p3q3: any;
  p3q4: any;
  p3q5: any;
  p3q6: any;
  p3q7: any;
  p3q8: any;
  p3q9: any;
  p3q10: any;
  p3q11: any;
  p3q12: any;
  p3q13: any;

  p4q1: any;

  currentBlock: any;
  constructor(private service: AuthService, private blockService: BlockService) {
  }

  ngOnInit() {
    this.subscriptions.add(
      this.blockService.selectedBlock$.pipe(
        map((res: any) => res)
      ).subscribe((res: any) => {
        this.currentBlock = res;
        this.getPerformanceEvaluationAnalytics(this.currentBlock);
      })
    )
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getPerformanceEvaluationAnalytics(block: any) {
    this.subscriptions.add(
      this.service.getPerformanceEvaluationAnalytics(block).subscribe((res: any) => {
        this.responseData = res.payload[0];
        console.log(this.responseData)


        const labelScale = ["Excellent", "Very Good", "Good", "Fair", "Poor"]
        const backgroundColor = ["#0e9f6e", "#84cc16", "#c27803", "#ff5a1f", "#f05252"]

        this.p1q1 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p1q1_5, this.responseData.p1q1_4, this.responseData.p1q1_3, this.responseData.p1q1_2, this.responseData.p1q1_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p1q2 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p1q2_5, this.responseData.p1q2_4, this.responseData.p1q2_3, this.responseData.p1q2_2, this.responseData.p1q2_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p1q3 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p1q3_5, this.responseData.p1q3_4, this.responseData.p1q3_3, this.responseData.p1q3_2, this.responseData.p1q3_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p1q4 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p1q4_5, this.responseData.p1q4_4, this.responseData.p1q4_3, this.responseData.p1q4_2, this.responseData.p1q4_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p1q5 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p1q5_5, this.responseData.p1q5_4, this.responseData.p1q5_3, this.responseData.p1q5_2, this.responseData.p1q5_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };


        this.p2q1 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p2q1_5, this.responseData.p2q1_4, this.responseData.p2q1_3, this.responseData.p2q1_2, this.responseData.p2q1_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p2q2 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p2q2_5, this.responseData.p2q2_4, this.responseData.p2q2_3, this.responseData.p2q2_2, this.responseData.p2q2_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p2q3 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p2q3_5, this.responseData.p2q3_4, this.responseData.p2q3_3, this.responseData.p2q3_2, this.responseData.p2q3_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p2q4 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p2q4_5, this.responseData.p2q4_4, this.responseData.p2q4_3, this.responseData.p2q4_2, this.responseData.p2q4_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p2q5 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p2q5_5, this.responseData.p2q5_4, this.responseData.p2q5_3, this.responseData.p2q5_2, this.responseData.p2q5_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p2q6 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p2q6_5, this.responseData.p2q6_4, this.responseData.p2q6_3, this.responseData.p2q6_2, this.responseData.p2q6_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p2q7 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p2q7_5, this.responseData.p2q7_4, this.responseData.p2q7_3, this.responseData.p2q7_2, this.responseData.p2q7_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p2q8 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p2q8_5, this.responseData.p2q8_4, this.responseData.p2q8_3, this.responseData.p2q8_2, this.responseData.p2q8_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };

        this.p3q1 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p3q1_5, this.responseData.p3q1_4, this.responseData.p3q1_3, this.responseData.p3q1_2, this.responseData.p3q1_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p3q2 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p3q2_5, this.responseData.p3q2_4, this.responseData.p3q2_3, this.responseData.p3q2_2, this.responseData.p3q2_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p3q3 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p3q3_5, this.responseData.p3q3_4, this.responseData.p3q3_3, this.responseData.p3q3_2, this.responseData.p3q3_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p3q4 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p3q4_5, this.responseData.p3q4_4, this.responseData.p3q4_3, this.responseData.p3q4_2, this.responseData.p3q4_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p3q5 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p3q5_5, this.responseData.p3q5_4, this.responseData.p3q5_3, this.responseData.p3q5_2, this.responseData.p3q5_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p3q6 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p3q6_5, this.responseData.p3q6_4, this.responseData.p3q6_3, this.responseData.p3q6_2, this.responseData.p3q6_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p3q7 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p3q7_5, this.responseData.p3q7_4, this.responseData.p3q7_3, this.responseData.p3q7_2, this.responseData.p3q7_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p3q8 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p3q8_5, this.responseData.p3q8_4, this.responseData.p3q8_3, this.responseData.p3q8_2, this.responseData.p3q8_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p3q9 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p3q9_5, this.responseData.p3q9_4, this.responseData.p3q9_3, this.responseData.p3q9_2, this.responseData.p3q9_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p3q10 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p3q10_5, this.responseData.p3q10_4, this.responseData.p3q10_3, this.responseData.p3q10_2, this.responseData.p3q10_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p3q11 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p3q11_5, this.responseData.p3q11_4, this.responseData.p3q11_3, this.responseData.p3q11_2, this.responseData.p3q11_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p3q12 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p3q12_5, this.responseData.p3q12_4, this.responseData.p3q12_3, this.responseData.p3q12_2, this.responseData.p3q12_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };
        this.p3q13 = {
          labels: labelScale,
          datasets: [
            {
              data: [this.responseData.p3q13_5, this.responseData.p3q13_4, this.responseData.p3q13_3, this.responseData.p3q13_2, this.responseData.p3q13_1],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };


        this.p4q1 = {
          labels: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
          datasets: [
            {
              label: `Students under ${this.currentBlock}`,
              data: [this.responseData.p4q1_excellent, this.responseData.p4q1_verygood, this.responseData.p4q1_good, this.responseData.p4q1_fair, this.responseData.p4q1_poor],
              hidden: false,
              backgroundColor: backgroundColor
            },
          ]
        };

      })
    )
  }

}
