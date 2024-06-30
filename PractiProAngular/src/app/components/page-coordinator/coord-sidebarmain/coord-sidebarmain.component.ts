import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CoordClassesComponent } from '../coord-classes/coord-classes.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { BlockService } from '../../../services/block.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-coord-sidebarmain',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './coord-sidebarmain.component.html',
  styleUrl: './coord-sidebarmain.component.css'
})
export class CoordSidebarmainComponent {
  constructor(private service: AuthService, private dialog: MatDialog, private blockService: BlockService) { }

  selectedBlock: any;
  coordinatorId: any;
  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.coordinatorId = this.service.getCurrentUserId();
    console.log("ID: " + this.coordinatorId);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  openClassesPopup() {
    const popup = this.dialog.open(CoordClassesComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "300ms",
      width: "90%",
      data: {
        coordinatorId: this.coordinatorId
      }
    })
    this.subscriptions.add(
      popup.afterClosed().subscribe(res => {
        this.selectedBlock = res;
        this.blockService.setSelectedBlock(res);
        console.log(this.selectedBlock)
      }));

  }

}
