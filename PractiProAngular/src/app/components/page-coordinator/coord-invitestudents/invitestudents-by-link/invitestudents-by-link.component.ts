import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { FormBuilder } from '@angular/forms';
import { BlockService } from '../../../../services/block.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-invitestudents-by-link',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invitestudents-by-link.component.html',
  styleUrl: './invitestudents-by-link.component.css'
})
export class InvitestudentsByLinkComponent implements OnInit, OnDestroy {
  link: any;
  private subscriptions = new Subscription();
  constructor(
    private builder: FormBuilder,
    private service: AuthService,
    private blockService: BlockService
  ) { }

  ngOnInit(): void {
    this.service.clearExpiredJoinLinks();
    this.subscriptions.add(
      this.blockService.selectedBlock$.subscribe(block => {
        const currentBlock = block;
        if (currentBlock) {
          this.generateLink(currentBlock);
        }
      }));
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  generateLink(block: string) {
    const classForm = this.builder.group({
      class: block
    })
    this.subscriptions.add(
      this.service.createClassJoinLink(classForm.value).subscribe((res: any) => {
        this.link = res.payload;
      }))
  }

  copyLink() {
    if (this.link) {
      const textarea = document.createElement('textarea');
      textarea.value = this.link;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      Swal.fire({
        toast: true,
        position: "top-end",
        backdrop: false,
        title: `Link copied to clipboard!`,
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  }
}
