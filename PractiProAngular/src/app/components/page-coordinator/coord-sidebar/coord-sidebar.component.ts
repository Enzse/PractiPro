import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CoordClassesComponent } from '../coord-classes/coord-classes.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { BlockService } from '../../../services/block.service';

@Component({
  selector: 'app-coord-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './coord-sidebar.component.html',
  styleUrl: './coord-sidebar.component.css'
})
export class CoordSidebarComponent implements OnInit {
  constructor(private service: AuthService, private dialog: MatDialog, private blockService: BlockService) { }

  selectedBlock: any;
  coordinatorId: any;

  ngOnInit(): void {
    this.coordinatorId = this.service.getCurrentUserId();
    console.log("ID: "+ this.coordinatorId);
  }


  openClassesPopup() {
    const popup = this.dialog.open(CoordClassesComponent, {
      enterAnimationDuration: "350ms",
      exitAnimationDuration: "300ms",
      width: "50%",
      data: {
        coordinatorId: this.coordinatorId
      }
    })
    popup.afterClosed().subscribe(res => {
      this.selectedBlock = res;
      this.blockService.setSelectedBlock(res);
      console.log(this.selectedBlock)
    });

  }

}
