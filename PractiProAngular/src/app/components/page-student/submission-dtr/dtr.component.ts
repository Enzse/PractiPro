import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { CommentspopupComponent } from '../../popups/shared/commentspopup/commentspopup.component';
import { Observable, timer } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-dtr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dtr.component.html',
  styleUrl: './dtr.component.css'
})
export class DtrComponent {

  public time$: Observable<Date>;
  public dateToday$: Observable<string>;
  user: any;
  datalist: any[] = [];


  constructor(private service: AuthService, private dialog: MatDialog) {
    this.time$ = timer(0, 1000).pipe(
      map(() => new Date()),
      shareReplay(1)
    );

    this.dateToday$ = timer(0, 1000 * 60 * 60 * 24).pipe(
      map(() => {
        const today = new Date();
        return today.toDateString();
      }),
      shareReplay(1)
    );

  }
















  viewComments(submissionId: number, fileName: string) {
    const popup = this.dialog.open(CommentspopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        submissionID: submissionId,
        fileName: fileName,
        table: 'comments_dtr'
      }
    })
    popup.afterClosed().subscribe(res => {
      // this.loadData()
    });
  }

}
