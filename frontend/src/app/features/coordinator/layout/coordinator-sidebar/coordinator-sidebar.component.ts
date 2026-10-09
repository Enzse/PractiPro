import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ClassPickerDialogComponent } from '../../dialogs/class-picker-dialog/class-picker-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SelectedClassService } from '../../selected-class.service';
import { Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SessionService } from '../../../../core/auth/session.service';
import { SidebarService } from '../../../../core/layout/sidebar.service';


@Component({
    selector: 'app-coordinator-sidebar',
    imports: [RouterLink, RouterLinkActive, RouterOutlet, MatTooltipModule],
    templateUrl: './coordinator-sidebar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coordinator-sidebar.component.css'
})
export class CoordinatorSidebarComponent implements OnInit, OnDestroy {
  protected readonly sidebarState = inject(SidebarService);
  private readonly session = inject(SessionService);
  constructor(private dialog: MatDialog, private blockService: SelectedClassService) { }

  selectedBlock: any;
  coordinatorId: number | undefined;
  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.coordinatorId = this.session.requireUserId();
    this.openClassesPopup();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  openClassesPopup() {
    const popup = this.dialog.open(ClassPickerDialogComponent, {
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
