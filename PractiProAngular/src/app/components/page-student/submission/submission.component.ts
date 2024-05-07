import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../../services/auth.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-submission',
  standalone: true,
  imports: [NavbarComponent, MatTabsModule, CommonModule],
  templateUrl: './submission.component.html',
  styleUrl: './submission.component.css'
})
export class SubmissionComponent {
  constructor(private authService: AuthService) { }
  successtoast = false;

  selectedTabLabel: string = 'Resume';
  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabLabel = event.tab.textLabel.split(" ").join("");
  }

  submitFiles() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const userId = this.authService.getCurrentUserId();

    if (!userId) {
      console.error('User ID not found.');
      return;
    }

    fileInputs.forEach((fileInput: any) => {
      const file = fileInput.files[0];
      if (file) {
        this.authService.uploadFile(userId, file, this.selectedTabLabel).subscribe(
          response => {
            console.log('File uploaded successfully:', response);
            this.successtoast = true;
            setTimeout(() => this.successtoast = false, 3000);
          },
          error => {
            console.error('Error uploading file:', error);
            // Handle error, e.g., show an error message to the user
          }
        );
      }
    });
  }
}