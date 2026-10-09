import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataRefreshService {
  private changeDetectedSource = new BehaviorSubject<boolean>(false);
  changeDetected$ = this.changeDetectedSource.asObservable();

  notifyChange(changeDetected: boolean) {
    this.changeDetectedSource.next(changeDetected);
  }
}
