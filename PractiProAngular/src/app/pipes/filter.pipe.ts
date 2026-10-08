import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if(!value) return null;
    if(!args) return value;

    args=args.toLowerCase();
    // Search the values only: stringifying the whole object would also match
    // field names, so searching "name" would match every row.
    return value.filter(function(item:any){
      return JSON.stringify(Object.values(item)).toLowerCase().includes(args);
    })
  }

}
