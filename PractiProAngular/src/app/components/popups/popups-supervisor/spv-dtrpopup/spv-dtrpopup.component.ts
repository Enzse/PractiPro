
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';
import { Subscription } from 'rxjs';
import { TimePipe } from '../../../../pipes/time.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-spv-dtrpopup',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, FormsModule, TimePipe],
  templateUrl: './spv-dtrpopup.component.html',
  styleUrl: './spv-dtrpopup.component.css'
})
export class SpvDtrpopupComponent implements OnInit, OnDestroy {
  constructor(private service: AuthService, private changeDetection: ChangeDetectionService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<SpvDtrpopupComponent>, private dialog2: MatDialog) { }

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
  closePopup() {
    this.dialog.close();
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
          this.changeDetection.notifyChange(true);
          Swal.fire({
            toast: true,
            position: "top-end",
            backdrop: false,
            title: `Submission successfully set to '${record.status}'.`,
            icon: "success",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        },
        error => {
          Swal.fire({
            toast: true,
            position: "top-end",
            backdrop: false,
            title: `Error occured. You might no have permission to edit this record.`,
            icon: "error",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
        }
      ));
  }

}
