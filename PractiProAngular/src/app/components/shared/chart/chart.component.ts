import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { Chart, ChartData, ChartOptions, ChartType } from 'chart.js/auto';

/**
 * A Chart.js chart. Takes the same inputs as the PrimeNG <p-chart> it replaces:
 * the chart is rebuilt whenever type, data or options change.
 */
@Component({
  selector: 'app-chart',
  standalone: true,
  template: '<div class="relative"><canvas #canvas role="img"></canvas></div>',
  styles: ':host { display: block; }',
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) type!: ChartType;
  @Input() data: ChartData | undefined;
  @Input() options: ChartOptions | undefined;

  @ViewChild('canvas') private canvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(): void {
    if (this.canvas) {
      this.render();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    this.chart?.destroy();
    this.chart = new Chart(this.canvas.nativeElement, {
      type: this.type,
      data: this.data ?? { datasets: [] },
      options: this.options,
    });
  }
}
