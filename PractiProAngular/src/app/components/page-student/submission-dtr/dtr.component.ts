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
export class DtrComponent implements OnInit {

  public time$: Observable<Date>;
  public dateToday$: Observable<string>;
  userId: any
  datalist:any;


  constructor(private service: AuthService, private dialog: MatDialog) {
    this.userId = this.service.getCurrentUserId();
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


  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.service.getDtrs(this.userId).subscribe((res: any) => {
      this.datalist = res.payload;
    }
    );
  }

  clockIn() {
    this.service.dtrClockIn(this.userId, null).subscribe((res: any) => {
      this.loadData();
      Swal.fire({
        title: "Successfully clocked in for today!",
        icon: "success"
      });
    }, error => {
      if (error.status == 400) {
        Swal.fire({
          title: "You've already clocked-in.",
          text: "You already have an active clock-in. Please clock out first.",
          confirmButtonText: 'Oh, ok',
          confirmButtonColor: '#d35e46'
        });
      };
    })
  }

  clockOut() {
    this.service.dtrClockOut(this.userId, null).subscribe((res: any) => {
      this.loadData();
      Swal.fire({
        title: "Successfully clocked out for today!",
        icon: "success"
      });
    }, error => {
      if (error.status == 400) {
        console.log(error);
        Swal.fire({
          title: "You haven't clocked in yet.",
          text: "No active clock-in found for today. Please clock in first.",
          confirmButtonText: 'Oh, ok',
          confirmButtonColor: '#d35e46'
        });
      };
    })
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
