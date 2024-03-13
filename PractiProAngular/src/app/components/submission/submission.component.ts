import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-submission',
  standalone: true,
  imports: [NavbarComponent, MatTabsModule],
  templateUrl: './submission.component.html',
  styleUrl: './submission.component.css'
})
export class SubmissionComponent {
  constructor(private service: AuthService) {

  }

  submitFiles() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const user_id = this.service.getCurrentUserId();

    if (!user_id) {
      console.error('User ID not found.');
      return;
    }

    fileInputs.forEach((fileInput: any) => {
      const file = fileInput.files[0];
      if (file) {
        this.service.uploadFile(user_id, file).subscribe(
          response => {
            console.log('File uploaded successfully:', response);
            // Handle success, e.g., show a success message to the user
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