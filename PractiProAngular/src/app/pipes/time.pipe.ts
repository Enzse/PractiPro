import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time',
  standalone: true
})
export class TimePipe implements PipeTransform {

  transform(value: string, endTime: string): string {
    if (!value) return value;

    if (value === '00:00:00' && endTime === '00:00:00') {
      return 'No work';
    }

    const [hour, minute] = value.split(':');

    // Convert to 12-hour format
    const hourNumber = parseInt(hour, 10);
    const ampm = hourNumber >= 12 ? 'PM' : 'AM';
    const formattedHour = hourNumber % 12 || 12;
    const formattedMinute = minute;

    return `${formattedHour}:${formattedMinute} ${ampm}`;
  }
}
