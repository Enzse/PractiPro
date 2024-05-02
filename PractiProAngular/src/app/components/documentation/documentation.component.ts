import { Component } from '@angular/core';
<<<<<<< Updated upstream
=======
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
>>>>>>> Stashed changes

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [],
  templateUrl: './documentation.component.html',
  styleUrl: './documentation.component.css'
})
export class DocumentationComponent {
  selectedFileName: string | null = null;
fileInput: any;
  constructor(private authService: AuthService) { }
  successtoast = false;

  onFileSelected(event: any){
    const file: File = event.target.files[0];
    const userId = this.authService.getCurrentUserId();

    if(file){
      console.log('Selected file: file');
      setTimeout(() => {
        this.selectedFileName = file.name;
      }, 1000);
    }
    
  }
  clearFile(){
    this.selectedFileName = null;
    const fileInput:  HTMLInputElement | null = document.getElementById('fileInput') as HTMLInputElement;
    if(fileInput){
      fileInput.value = '';
    }
  }
}
