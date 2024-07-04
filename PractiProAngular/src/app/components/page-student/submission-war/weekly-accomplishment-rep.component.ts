import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { CommentspopupComponent } from '../../popups/shared/commentspopup/commentspopup.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgxPaginationModule } from 'ngx-pagination';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-weekly-accomplishment-rep',
  standalone: true,
  imports: [FilterPipe, CommonModule, FormsModule, MatTabsModule, CommonModule, MatButtonModule, MatMenuModule, NgxPaginationModule],
  templateUrl: './weekly-accomplishment-rep.component.html',
  styleUrl: './weekly-accomplishment-rep.component.css'
})
export class WeeklyAccomplishmentRepComponent implements OnInit, OnDestroy {
  searchweek: any;
  userId: any;
  datalist: any[] = [];
  origlist: any;
  searchtext: any;
  tabWeekNumbers: number[] = [1];
  selectedTabLabel: number = 1;
  selectedRecord: any;
  selectedRecordActivities: any[] = [];
  private subscriptions = new Subscription();
  p: number = 1;


  constructor(private service: AuthService, private dialog: MatDialog) {
    this.userId = this.service.getCurrentUserId();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnInit() {
    this.loadWarRecord();
    this.loadMaxWeeks();
  }

  loadWarRecord() {
    this.subscriptions.add(
      this.service.getWarRecords(this.userId, this.selectedTabLabel).subscribe((res: any) => {
        this.selectedRecord = res.payload[0]
        this.loadWarActivities();
      })
    )
  }

  loadWarActivities() {
    if (this.selectedRecord) {
      this.subscriptions.add(
        this.service.getWarActivities(this.selectedRecord.id).subscribe((res: any) => {
          this.selectedRecordActivities = res.payload
          if (this.selectedRecordActivities.length === 0) {
            this.addRow()
          }
        })
      )
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    this.selectedRecordActivities = [];
    this.selectedTabLabel = parseInt(event.tab.textLabel.replace('Week ', ''), 10);
    this.loadWarRecord();
    this.addRow()
  }

  addRow() {
    const newActivity = {
      description: '',
      date: '',
      startTime: '09:00',
      endTime: '18:00',
      war_id: this.selectedRecord?.id
    };
    this.selectedRecordActivities.push(newActivity);
  }

  saveChanges() {
    this.service.clearWarActivities(this.selectedRecord.id).subscribe(res => {
      this.selectedRecordActivities.forEach(activity => {
        this.service.saveWarActivities(activity).subscribe((res: any) => {
        }
        )
      })
      Swal.fire({
        title: 'Changes Saved Successfully!',
        icon: 'success'
      })
    })
  }

  loadSubmittedRecords() {
    this.subscriptions.add(
      this.service.getSubmissionsByStudent('war', this.userId).subscribe(res => {
        this.datalist = res.payload.sort((a: any, b: any) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        this.origlist = this.datalist;
      }));
  }

  loadMaxWeeks() {
    this.subscriptions.add(
      this.service.getSubmissionMaxWeeks('war', this.userId).subscribe(
        res => {
          this.tabWeekNumbers = res;
        },
        error => {
          console.error('Error fetching week numbers:', error);
        }
      ));
  }

  setFilter(filter: string) {
    this.datalist = this.origlist;
    switch (filter) {
      case 'all':
        this.datalist = this.origlist;
        break;
      case 'a-approved':
        this.datalist = this.datalist.filter((user: any) => user.advisor_approval === 'Approved');
        break;
      case 'a-unapproved':
        this.datalist = this.datalist.filter((user: any) => user.advisor_approval === 'Unapproved');
        break;
      case 'a-pending':
        this.datalist = this.datalist.filter((user: any) => user.advisor_approval === 'Pending');
        break;
      case 's-approved':
        this.datalist = this.datalist.filter((user: any) => user.supervisor_approval === 'Approved');
        break;
      case 's-unapproved':
        this.datalist = this.datalist.filter((user: any) => user.supervisor_approval === 'Unapproved');
        break;
      case 's-pending':
        this.datalist = this.datalist.filter((user: any) => user.supervisor_approval === 'Pending');
        break;
    }
  }

  setFilterWeek(week: any) {
    this.datalist = this.origlist;
    this.datalist = this.datalist.filter((user: any) => user.week === week);

  }

  //SUBMISSION LOGIC
  addNewTab() {
    const nextWeekNumber = this.tabWeekNumbers[this.tabWeekNumbers.length - 1] + 1;
    this.tabWeekNumbers.push(nextWeekNumber);
  }

  deleteSubmission(submissionId: number) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.subscriptions.add(
          this.service.deleteSubmission(submissionId, 'war').subscribe((res: any) => {
            Swal.fire({
              title: "Your submission has been deleted",
              icon: "success"
            });
            this.loadSubmittedRecords();
          }, error => {
            Swal.fire({
              title: "Delete failed",
              text: "You may not have permission to delete this file.",
              icon: "error"
            });
          }));
      }
    });
  }

  viewComments(submissionId: number, fileName: string) {
    const popup = this.dialog.open(CommentspopupComponent, {
      enterAnimationDuration: "500ms",
      exitAnimationDuration: "500ms",
      width: "80%",
      data: {
        submissionID: submissionId,
        fileName: fileName,
        table: 'comments_war'
      }
    })
    this.subscriptions.add(
      popup.afterClosed().subscribe(res => {
        this.loadSubmittedRecords()
      }));
  }

}
