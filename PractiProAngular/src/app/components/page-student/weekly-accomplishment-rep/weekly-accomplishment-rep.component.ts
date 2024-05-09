import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import saveAs from 'file-saver';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-weekly-accomplishment-rep',
  standalone: true,
  imports: [NavbarComponent, MatTabsModule, CommonModule],
  templateUrl: './weekly-accomplishment-rep.component.html',
  styleUrl: './weekly-accomplishment-rep.component.css'
})
export class WeeklyAccomplishmentRepComponent {
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.loadData();
  }

  successtoast = false;
  tabWeekNumbers: number[] = [];

  ngOnInit() {
    const userId = this.service.getCurrentUserId();
    console.log(userId);
    this.service.getMaxWarWeeks(userId).subscribe(
      weekNumbers => {
        this.tabWeekNumbers = weekNumbers;
      },
      error => {
        console.error('Error fetching week numbers:', error);
      }
    );
  }
  addNewTab() {
    const nextWeekNumber = this.tabWeekNumbers[this.tabWeekNumbers.length - 1] + 1;
    this.tabWeekNumbers.push(nextWeekNumber);
  }

  selectedTabLabel: number = 1;
  onTabChange(event: MatTabChangeEvent) {

    this.selectedTabLabel = parseInt(event.tab.textLabel.replace('Week ', ''), 10);
  }

  submitFiles() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const userId = this.service.getCurrentUserId();

    if (!userId) {
      console.error('User ID not found.');
      return;
    }

    fileInputs.forEach((fileInput: any) => {
      const file = fileInput.files[0];
      if (file) {
        this.service.uploadWar(userId, file, this.selectedTabLabel).subscribe(
          response => {
            console.log('File uploaded successfully:', response);
            this.successtoast = true;
            setTimeout(() => this.successtoast = false, 3000);
          },
          error => {
            console.error('Error uploading file:', error);
          }
        );
      }
    });

    // this.loadData();
  }



  user: any;
  students: any;
  datalist: any;
  dataSource: any;

  loadData() {
    this.user = this.service.getCurrentUserId();
    this.service.getWarByUser(this.user).subscribe(res => {
      console.log(res);
      this.datalist = res;
      // console.log(this.students);
      this.dataSource = new MatTableDataSource(this.datalist);
    });
  }

  downloadWar(submissionId: number, fileName: string) {
    this.service.downloadWar(submissionId).subscribe(
      (data: any) => {
        saveAs(data, fileName);
      },
      (error: any) => {
        console.error('Error downloading submission:', error);
      }
    );
  }

}
