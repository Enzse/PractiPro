
import { Component, OnInit, Inject, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { DataRefreshService } from '../../../../core/data-refresh.service';
import { Subscription } from 'rxjs';
import { FilterPipe } from '../../../../shared/pipes/filter.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TimePipe } from '../../../../shared/pipes/time.pipe';
import { DtrService } from '../../../../core/api/dtr.service';

@Component({
    selector: 'app-coordinator-dtr-dialog',
    imports: [CommonModule, MatButtonModule, MatMenuModule, TimePipe, MatTooltipModule, NgxPaginationModule, FilterPipe, FormsModule],
    templateUrl: './coordinator-dtr-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './coordinator-dtr-dialog.component.css'
})
export class CoordinatorDtrDialogComponent {
  private readonly dtrApi = inject(DtrService);
  constructor(private changeDetection: DataRefreshService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<CoordinatorDtrDialogComponent>, private dialog2: MatDialog) { }

  origlist: any;
  searchtext: any;
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
  closePopup() {
    this.dialog.close();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadData() {
    this.subscriptions.add(
      this.dtrApi.forStudent(this.data.student.id).subscribe((res) => {
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
        this.datalist = this.datalist.filter((user) => user.status === 'Approved');
        break;
      case 'unapproved':
        this.datalist = this.datalist.filter((user) => user.status === 'Unapproved');
        break;
      case 'pending':
        this.datalist = this.datalist.filter((user) => user.status === 'Pending');
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
      this.dtrApi.setStatus(record.id, updateData).subscribe(
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
