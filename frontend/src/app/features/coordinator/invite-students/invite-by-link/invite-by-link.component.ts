import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { SelectedClassService } from '../../selected-class.service';
import { Subscription } from 'rxjs';

import Swal from 'sweetalert2';
import { ClassJoinService } from '../../../../core/api/class-join.service';

@Component({
    selector: 'app-invite-by-link',
    imports: [],
    templateUrl: './invite-by-link.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './invite-by-link.component.css'
})
export class InviteByLinkComponent implements OnInit, OnDestroy {
  private readonly classJoinApi = inject(ClassJoinService);
  link: string | undefined;
  private subscriptions = new Subscription();
  constructor(
    private builder: NonNullableFormBuilder,
    private blockService: SelectedClassService
  ) { }

  ngOnInit(): void {
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
      this.classJoinApi.createLink(classForm.getRawValue()).subscribe((res) => {
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
