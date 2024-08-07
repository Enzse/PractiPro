import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { initFlowbite } from 'flowbite';
@Component({
  selector: 'app-spv-edit-company-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatDialogActions, MatDialogClose],
  templateUrl: './spv-edit-company-profile.component.html',
  styleUrl: './spv-edit-company-profile.component.css'
})
export class SpvEditCompanyProfileComponent implements OnInit {

  companyData: any;
  editForm: any;

  constructor(private builder: FormBuilder, private service: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<SpvEditCompanyProfileComponent>) {
    this.editForm = this.builder.group({
      company_ceo: this.data.company.company_ceo,
      address: this.data.company.address,
      company_size: this.data.company.company_size,
      industry: this.data.company.industry,
      scope_of_business: this.data.company.scope_of_business,
      itEquipment: this.data.itEquipment ? this.data.itEquipment : ''
    });
  }


  ngOnInit(): void {
    initFlowbite();
  }


  //This is for the Submit button functionality.
  editInformation() {
    if (this.editForm.valid) {
      this.service.editStudentInfo(this.service.getCurrentUserId(), this.editForm.value).subscribe(res => {
        console.log("Updated successfully.");
        this.dialog.close();
      })
    } else {
      Swal.fire({
        title: "Invalid Input",
        text: "Double-check your information to see any forms you've mistakenly entered.",
        icon: "error"
      });
    }
  }

  closePopup() {
    this.dialog.close();
  }
}
