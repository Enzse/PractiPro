
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';
import { Subscription } from 'rxjs';
import { FilterPipe } from '../../../../pipes/filter.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-dtrpopupcomponent',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, MatTooltipModule, NgxPaginationModule, FilterPipe, FormsModule],
  templateUrl: './dtrpopupcomponent.component.html',
  styleUrl: './dtrpopupcomponent.component.css'
})
export class DtrpopupcomponentComponent {
  constructor(private service: AuthService, private changeDetection: ChangeDetectionService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<DtrpopupcomponentComponent>, private dialog2: MatDialog) { }

  origlist:any;
  searchtext:any;
  isLoading = true;
  p: number = 1;
  itemsPerPage: number = 7
  datalist: any[] = [];
  groupedRecords: any[] = [];
  private subscriptions = new Subscription();

  setInitialPage(): void {
    const totalItems = this.datalist.length;
    const totalPages = Math.ceil(totalItems / this.itemsPerPage);
    this.p = totalPages;
  }

  ngOnInit(): void {
    this.loadData();

  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
      this.service.getDtrs(this.data.student.id).subscribe((res: any) => {
        this.datalist = res.payload;
        this.datalist = this.addWeekNumberToRecords(res.payload, this.data.student.hire_date);
        this.origlist = this.datalist;
        this.setInitialPage();
      }
      ));
  }

  setFilter(filter: string) {
    this.p = 1;
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


  addWeekNumberToRecords(records: any[], hireDate: string): any[] {
    const hireDateObj = new Date(hireDate);
    return records.map(record => {
      const recordDate = new Date(record.date);
      const weekNumber = Math.floor((recordDate.getTime() - hireDateObj.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
      return { ...record, weekNumber };
    });
  }

  onStatusChange(record: any) {
    const updateData = { status: record.status };
    this.subscriptions.add(
      this.service.updateDTRStatus(record.id, updateData).subscribe(
        res => {
          console.log('Status updated successfully:', res);
          this.changeDetection.notifyChange(true);
        },
        error => {
          console.error('Error updating status:', error);
        }
      ));
  }
}
