import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Observable, Subscription, timer } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { TimePipe } from '../../../pipes/time.pipe';
import { SessionService } from '../../../services/session.service';
import { StudentService } from '../../../services/api/student.service';
import { DtrService } from '../../../services/api/dtr.service';

@Component({
    selector: 'app-dtr',
    imports: [CommonModule, FormsModule, FilterPipe, TimePipe, MatButtonModule, MatMenuModule, MatTooltipModule, NgxPaginationModule, MatTooltipModule],
    templateUrl: './dtr.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './dtr.component.css'
})
export class DtrComponent implements OnInit, OnDestroy {
  private readonly session = inject(SessionService);
  private readonly studentApi = inject(StudentService);
  private readonly dtrApi = inject(DtrService);
  searchtext: any;
  public time$: Observable<Date>;
  public dateToday$: Observable<string>;
  userId: number
  datalist: any[] = [];
  origlist: any;
  private subscriptions = new Subscription();
  //Pagenation Settings
  p: number = 1;
  itemsPerPage: number = 7


  constructor(private dialog: MatDialog) {
    this.userId = this.session.requireUserId();
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
      this.dtrApi.forStudent(this.userId).subscribe((res) => {
        this.datalist = res.payload;
        this.studentApi.ojtStatus(this.userId).subscribe((res) => {
          const hireDate = res.payload[0].hire_date
          this.datalist = this.addWeekNumberToRecords(this.datalist, hireDate);
          this.origlist = this.datalist;
          console.log(this.datalist);
        })
        this.setInitialPage();
      }
      ));
  }

  /** Week 1 starts on the hire date; before the student is hired there are no week numbers. */
  addWeekNumberToRecords(records: any[], hireDate: string | null): any[] {
    if (!hireDate) {
      return records.map(record => ({ ...record, weekNumber: null }));
    }
    const hireDateObj = new Date(hireDate);
    return records.map(record => {
      const recordDate = new Date(record.date);
      const weekNumber = Math.floor((recordDate.getTime() - hireDateObj.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
      return { ...record, weekNumber };
    });
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
      this.dtrApi.clockIn(this.userId).subscribe((res) => {
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
      this.dtrApi.clockOut(this.userId).subscribe((res) => {
        this.subscriptions.add(
          this.dtrApi.clearShortRecords(this.userId).subscribe((res) => {
            console.log(res);
            if (res.status.message.includes("Successfully deleted")) {
              Swal.fire({
                title: "Minimum hours not met",
                text: "A record must be worth at least 1 hour to be recorded.",
                icon: "warning"
              });
            } else {
              Swal.fire({
                title: "Successfully clocked out for today!",
                icon: "success"
              });
            }
            this.loadData();
          })
        )
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
