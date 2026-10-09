import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DialogShellComponent } from '../../../shared/ui/dialog-shell/dialog-shell.component';

/** PractiPro's Terms of Service. */
@Component({
  selector: 'app-terms-dialog',
  imports: [DialogShellComponent],
  template: `
    <app-dialog-shell title="Terms of Service" icon="file-text">
      <div class="space-y-4 text-sm leading-6 text-slate-700">
        <p>Welcome to PractiPro ("Online Practicum Submission Platform"). By accessing or using our Website, you agree to comply with and be bound by the following Terms of Service ("ToS"). Please read these ToS carefully before using the Website.</p>
        @for (section of sections; track section.title) {
          <section>
            <h3 class="font-semibold text-slate-900">{{ section.title }}</h3>
            @for (paragraph of section.text; track $index) {
              <p class="mt-1">{{ paragraph }}</p>
            }
            @if (section.list) {
              <ul class="mt-1 list-disc space-y-1 pl-5">
                @for (item of section.list; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            }
          </section>
        }
        <section>
          <h3 class="font-semibold text-slate-900">10. Contact Information</h3>
          <p class="mt-1">For any questions or concerns regarding these ToS or to negotiate a licensing agreement, please contact us at:</p>
          <p class="mt-1">Denzel Manz S. Perez<br />+63927-945-6060<br />denzelmanzperez1&#64;gmail.com</p>
        </section>
        <p>By using this Website, you acknowledge that you have read, understood, and agree to be bound by these ToS.</p>
      </div>
    </app-dialog-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TermsDialogComponent {
  protected readonly sections: { title: string; text: string[]; list?: string[] }[] = [
    {
      title: '1. Acceptance of Terms',
      text: ['By accessing and using this Website, you accept and agree to be bound by the terms and provisions of this ToS. If you do not agree to these terms, you should not use this Website.'],
    },
    {
      title: '2. Intellectual Property Rights',
      text: ['All code, design, and databases on this Website are the intellectual property of Denzel Manz S. Perez and are protected by copyright and other intellectual property laws. Unauthorized theft of any content is strictly prohibited.'],
    },
    {
      title: '3. User Responsibilities',
      text: ['Users agree to use the Website only for lawful purposes and in a manner that does not infringe the rights of or restrict or inhibit the use and enjoyment of the Website by any third party.'],
    },
    {
      title: '4. Restrictions on Use',
      text: ['You may not:'],
      list: [
        'Reproduce, duplicate, copy, sell, trade, resell, or exploit any portion of the Website for any commercial purposes without explicit written permission from Denzel Manz S. Perez.',
        'Modify, adapt, translate, or reverse engineer any portion of the Website.',
        'Use the Website for any purpose that is unlawful or prohibited by these ToS.',
      ],
    },
    {
      title: '5. Educational Institution Use',
      text: ['Educational institutions wishing to employ this Website for their purposes must first enter into a formal agreement with Denzel Manz S. Perez. Unauthorized use by any educational institution is strictly prohibited.'],
    },
    {
      title: '6. Licensing Agreement',
      text: ['A separate licensing agreement must be negotiated and signed by an authorized representative of the educational institution and Denzel Manz S. Perez before any use of the Website by the institution.'],
    },
    {
      title: '7. Termination',
      text: ['We reserve the right to terminate access to the Website without notice for any user who violates these ToS or uses the Website for unauthorized purposes.'],
    },
    {
      title: '8. Limitation of Liability',
      text: ['In no event shall Denzel Manz S. Perez be liable for any direct, indirect, incidental, special, or consequential damages arising out of the use or inability to use the Website.'],
    },
    {
      title: '9. Governing Law',
      text: ['These ToS are governed by and construed in accordance with the laws of the Philippines, without regard to its conflict of law principles.'],
    },
  ];
}

/** What PractiPro asks of company supervisors. */
@Component({
  selector: 'app-supervisor-notice-dialog',
  imports: [DialogShellComponent],
  template: `
    <app-dialog-shell title="Notice to supervisors" icon="buildings">
      <div class="space-y-3 text-sm leading-6 text-slate-700">
        <p>By registering a supervisor account for PractiPro, you agree to have a student to supervise under PractiPro in conducting their Practicum Program.</p>
        <p>The student must work to meet 200 total hours of training to complete their Practicum Program. This is a very important part of the student’s professional training. The student earns unit credits and must keep a daily log book (practicum journal) and write an extensive report. Each student is evaluated by a practicum coordinator as well as by the employer. It is important for the students’ supervisor to take time to talk to the practicum coordinators when they come to evaluate the student.</p>
        <p>We are looking for employers who are willing to provide meaningful training for our students. Please sit down with the student to discuss his/her background and experiences. Discuss learning opportunities at your site and try to provide training that will strengthen the student’s background.</p>
        <p>We rely heavily on your evaluation of the students’ readiness to become professionals in their field in the future. Please provide various learning opportunities and evaluate the students’ knowledge and abilities.</p>
        <p>More than one student may be seeking OJT supervision with you. From past experience, it is usually desirable to have no more than two students at one site. However, circumstances at your site may facilitate your ability to successfully handle more than two. That will be up to you.</p>
      </div>
    </app-dialog-shell>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupervisorNoticeDialogComponent {}
