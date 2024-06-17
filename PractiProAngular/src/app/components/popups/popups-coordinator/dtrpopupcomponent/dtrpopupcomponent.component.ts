
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dtrpopupcomponent',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, FormsModule],
  templateUrl: './dtrpopupcomponent.component.html',
  styleUrl: './dtrpopupcomponent.component.css'
})
export class DtrpopupcomponentComponent {
  constructor(private service: AuthService, private changeDetection: ChangeDetectionService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<DtrpopupcomponentComponent>, private dialog2: MatDialog) { }

  studentSubmissions: any[] = [];
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
    console.log(this.data.student.id)
    this.subscriptions.add(
      this.service.getDtrs(this.data.student.id).subscribe((res: any) => {
        console.log(res)
        this.datalist = res.payload;
        this.datalist = this.addWeekNumberToRecords(res.payload, this.data.student.hire_date);
        console.log(this.datalist);
        this.setInitialPage();
      }
      ));
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
