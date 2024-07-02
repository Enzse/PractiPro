import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Observable, Subscription, map } from 'rxjs';
import { initFlowbite } from 'flowbite';
import { BlockService } from '../../../services/block.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-coord-dashboard',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './coord-dashboard.component.html',
  styleUrl: './coord-dashboard.component.css'
})
export class CoordDashboardComponent implements OnInit {
  userId: any;
  private subscriptions = new Subscription();
  blockData: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private service: AuthService, private blockService: BlockService) {
    this.userId = this.service.getCurrentUserId();


  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.blockService.selectedBlock$.pipe(
        map((res: any) => res)
      ).subscribe((res: any) => {
        const currentBlock = res;
        this.loadClass(currentBlock);
      })
    )
  }


  loadClass(block: any) {
    this.service.getClassData(block).subscribe((res: any) => {
      this.blockData = res.payload[0];
      console.log(this.blockData);
    })
  }
}
