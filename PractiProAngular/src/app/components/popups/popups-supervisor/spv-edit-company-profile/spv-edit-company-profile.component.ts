import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ChangeDetectionService } from '../../../../services/shared/change-detection.service';
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
  selectedEquipment: string[] = [];
  equipmentOptions = [
    'desktop', 'laptop', 'ipad', 'tablet', 'smartphone',
    'server', 'router', 'printer', 'scanner', 'virtual-machine',
    'cabling', 'other'
  ];

  constructor(private builder: FormBuilder, private service: AuthService, private changeDetection: ChangeDetectionService,
    @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<SpvEditCompanyProfileComponent>) {
    this.editForm = this.builder.group({
      id: this.builder.control(this.data.company.id),
      company_ceo: this.builder.control(this.data.company.company_ceo),
      address: this.builder.control(this.data.company.address),
      company_size: this.builder.control(this.data.company.company_size),
      industry: this.builder.control(this.data.company.industry),
      scope_of_business: this.builder.control(this.data.company.scope_of_business),
      itEquipment: this.builder.control([])
    });
  }

  onCheckboxChange(event: any) {
    const checkbox = event.target;
    if (checkbox.checked) {
      this.selectedEquipment.push(checkbox.value);
    } else {
      const index = this.selectedEquipment.indexOf(checkbox.value);
      if (index > -1) {
        this.selectedEquipment.splice(index, 1);
      }
    }
    this.editForm.controls['itEquipment'].setValue(this.selectedEquipment);
    console.log(this.editForm.value)
  }


  ngOnInit() {
    console.log(this.data)
    if (this.data.company.it_equipment) {
      this.selectedEquipment = this.data.company.it_equipment;
      this.editForm.get('itEquipment').setValue(this.selectedEquipment);
    }
    this.checkSelectedCheckboxes();
  }

  checkSelectedCheckboxes() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      if (this.selectedEquipment.includes(checkbox.getAttribute('value') || '')) {
        (checkbox as HTMLInputElement).checked = true;
      }
    });
  }

  saveChanges() {
    if (this.editForm.valid) {
      console.log(this.editForm.value)
      this.service.editCompanyProfile(this.editForm.value).subscribe(res => {
        console.log("Updated successfully.");
        this.changeDetection.notifyChange(true);
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
