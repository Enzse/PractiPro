import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [NavbarComponent, MatTabsModule, CommonModule],
  templateUrl: './documentation.component.html',
  styleUrl: './documentation.component.css'
})
export class DocumentationComponent implements OnInit {
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.loadData();
  }

  successtoast = false;
  tabWeekNumbers: number[] = [];

  ngOnInit() {
    const userId = this.service.getCurrentUserId();
    this.service.getMaxDocsWeeks(userId).subscribe(
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
        this.service.uploadDocumentation(userId, file, this.selectedTabLabel).subscribe(
          response => {
            console.log('File uploaded successfully:', response);
            this.successtoast = true;
            setTimeout(() => this.successtoast = false, 3000);
            this.loadData();
          },
          error => {
            console.error('Error uploading file:', error);
          }
        );
      }
    });

  
  }



  user: any;
  students: any;
  datalist: any[] = [];
  dataSource: any;

  loadData() {
    this.user = this.service.getCurrentUserId();
    this.service.getDocumentationsByUser(this.user).subscribe(res => {
      this.datalist = res;
      // console.log(this.students);
      this.dataSource = new MatTableDataSource(this.datalist);
    });
  }

  downloadDocumentation(submissionId: number, fileName: string) {
    this.service.downloadDocumentation(submissionId).subscribe(
      (data: any) => {
        saveAs(data, fileName);
      },
      (error: any) => {
        console.error('Error downloading submission:', error);
      }
    );
  }


}
