import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlockService {
  private selectedBlock = new BehaviorSubject<any>(null); // Default value is 1
  selectedBlock$ = this.selectedBlock.asObservable();

  setSelectedBlock(block: string) {
    this.selectedBlock.next(block);
    console.log(`blockservice: ${this.selectedBlock.value}`)
  }

  getSelectedBlock() {
    return this.selectedBlock.value;
  }
}
