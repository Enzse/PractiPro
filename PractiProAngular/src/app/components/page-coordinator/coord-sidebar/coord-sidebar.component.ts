import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CoordClassesComponent } from '../coord-classes/coord-classes.component';
import { MatDialog } from '@angular/material/dialog';
import { BlockService } from '../../../services/block.service';
import { Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SessionService } from '../../../services/session.service';
import { SidebarService } from '../../../services/sidebar.service';


@Component({
    selector: 'app-coord-sidebar',
    imports: [RouterLink, RouterLinkActive, RouterOutlet, MatTooltipModule],
    templateUrl: './coord-sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coord-sidebar.component.css'
})
export class CoordSidebarComponent implements OnInit, OnDestroy {
  protected readonly sidebarState = inject(SidebarService);
  private readonly session = inject(SessionService);
  constructor(private dialog: MatDialog, private blockService: BlockService) { }

  selectedBlock: any;
  coordinatorId: any;
  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.coordinatorId = this.session.userId();
    this.openClassesPopup();
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
      }));

  }

}
