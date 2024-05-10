import { Component} from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import saveAs from 'file-saver';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-exit-poll',
  standalone: true,
  imports: [NavbarComponent, MatTabsModule, CommonModule],
  templateUrl: './exit-poll.component.html',
  styleUrl: './exit-poll.component.css'
})
export class ExitPollComponent {
  constructor(private service: AuthService, private dialog: MatDialog) {
    this.loadData();
  }

  successtoast = false;  

  submitFiles() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const userId = this.service.getCurrentUserId();

    if (!userId) {
      console.error('User ID not found.');
      return;
    }

    fileInputs.forEach((fileInput: any) => {
      const file = fileInput.files[0];
      console.log(file);
      if (file) {
        this.service.uploadFinalReport(userId, file).subscribe(
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
    this.service.getFinalReportByUser(this.user).subscribe(res => {
      if(res){
      this.datalist = res;
      this.dataSource = new MatTableDataSource(this.datalist);
      }
    });
  }

  downloadFinalReport(submissionId: number, fileName: string) {
    this.service.downloadFinalReport(submissionId).subscribe(
      (data: any) => {
        saveAs(data, fileName);
      },
      (error: any) => {
        console.error('Error downloading submission:', error);
      }
    );
  }
}
