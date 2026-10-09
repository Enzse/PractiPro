import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BlockService } from '../../../../services/block.service';
import { Subscription } from 'rxjs';

import Swal from 'sweetalert2';
import { ClassJoinService } from '../../../../services/api/class-join.service';

@Component({
    selector: 'app-invitestudents-by-link',
    imports: [],
    templateUrl: './invitestudents-by-link.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './invitestudents-by-link.component.css'
})
export class InvitestudentsByLinkComponent implements OnInit, OnDestroy {
  private readonly classJoinApi = inject(ClassJoinService);
  link: any;
  private subscriptions = new Subscription();
  constructor(
    private builder: FormBuilder,
    private blockService: BlockService
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
      this.classJoinApi.createLink(classForm.value as { class: string }).subscribe((res: any) => {
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
