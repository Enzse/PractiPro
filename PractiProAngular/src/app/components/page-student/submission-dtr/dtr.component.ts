import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { CommentspopupComponent } from '../../popups/shared/commentspopup/commentspopup.component';
import { Observable, Subscription, timer } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dtr',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe, MatButtonModule, MatMenuModule, MatTooltipModule, NgxPaginationModule, MatTooltipModule],
  templateUrl: './dtr.component.html',
  styleUrl: './dtr.component.css'
})
export class DtrComponent implements OnInit, OnDestroy {
  searchtext:any;
  public time$: Observable<Date>;
  public dateToday$: Observable<string>;
  userId: any
  datalist:any;
  origlist:any;
  private subscriptions = new Subscription();
  //Pagenation Settings
  p: number = 1; 
  itemsPerPage: number = 7


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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
    this.service.getDtrs(this.userId).subscribe((res: any) => {
      this.datalist = res.payload;
      this.origlist = this.datalist;
      this.setInitialPage();
    }
    ));
  }


  setFilter(filter: string) {
    this.datalist = this.origlist;
    switch (filter) {
      case 'all':
        this.datalist = this.origlist;
        break;
      case 'approved':
        this.datalist = this.datalist.filter((user: any) => user.status === 'Approved');
        break;
      case 'unapproved':
        this.datalist = this.datalist.filter((user: any) => user.status === 'Unapproved');
        break;
      case 'pending':
        this.datalist = this.datalist.filter((user: any) => user.status === 'Pending');
        break;
    }
  }


  setInitialPage(): void {
    const totalItems = this.datalist.length;
    const totalPages = Math.ceil(totalItems / this.itemsPerPage);
    this.p = totalPages;
  }

  clockIn() {
    this.subscriptions.add(
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
    }));
  }

  clockOut() {
    this.subscriptions.add(
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
    }));
  }


}
