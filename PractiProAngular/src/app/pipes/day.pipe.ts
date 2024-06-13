import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'day',
  standalone: true
})
export class DayPipe implements PipeTransform {

  private daysMap:any = {
    'Monday': 'Mon',
    'Tuesday': 'Tue',
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri',
    'Saturday': 'Sat',
    'Sunday': 'Sun'
  };

  transform(value: string): string {
    return this.daysMap[value] || value;
  }
}
