import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon/icon.component';
import { IconName } from '../../shared/ui/icon/icons.generated';

const GORDON_CCS = 'https://gordoncollege.edu.ph/ccs/';

/** The public "about PractiPro" page (/welcome). */
@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, IconComponent],
  templateUrl: './landing-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
  protected readonly gordonCcs = GORDON_CCS;

  protected readonly objectives: { icon: IconName; title: string; text: string }[] = [
    {
      icon: 'cloud-arrow-up',
      title: 'Every requirement in one place',
      text: 'Clear directions and a single home for practicum requirements and submissions, with easy uploads in a variety of file formats.',
    },
    {
      icon: 'chats-circle',
      title: 'Teachers and students, in touch',
      text: 'Smooth communication between teachers and students: answer questions, follow up on submissions and give constructive feedback.',
    },
    {
      icon: 'list-checks',
      title: 'Progress students can see',
      text: 'Students monitor their own progress, which makes practicum work more accessible and keeps everyone on track.',
    },
    {
      icon: 'seal-check',
      title: 'Less paperwork',
      text: 'Coordinators and supervisors complete evaluations online, based on what students submit, instead of on paper.',
    },
  ];

  protected readonly roles: { icon: IconName; title: string; text: string }[] = [
    { icon: 'student', title: 'Students', text: 'Submit requirements, log attendance, write weekly reports and see what’s left.' },
    { icon: 'chalkboard-teacher', title: 'Coordinators', text: 'Run practicum classes, review submissions and follow each student’s progress.' },
    { icon: 'buildings', title: 'Company supervisors', text: 'Approve trainees’ hours and reports, and evaluate their performance.' },
  ];

  protected readonly lead = { photo: 'denz', name: 'Denzel Manz Perez', role: 'Project Manager and Fullstack Developer' };
  protected readonly team: { photo: string; name: string; role: string }[] = [
    { photo: 'sherwin', name: 'Sherwin De Guzman', role: 'Wireframe Designer' },
    { photo: 'carmi', name: 'Carmi Wilna Tongson', role: 'Wireframe Designer' },
    { photo: 'dei', name: 'Deianne Jeinne Resurreccion', role: 'Wireframe Designer' },
    { photo: 'shwn', name: 'Shawn Tyrone D. Rada', role: 'Frontend Developer' },
    { photo: 'pajaro', name: 'Roescen Abie Pajaro', role: 'Frontend Developer' },
    { photo: 'jadev', name: 'Jade Vinas', role: 'Frontend Developer' },
    { photo: 'rj', name: 'Rj Verceles', role: 'Frontend Developer' },
    { photo: 'well', name: 'Jimmuel Bernardino', role: 'Frontend Developer' },
    { photo: 'nicholas', name: 'Nicolas Milton Ching', role: 'Quality Assurance' },
    { photo: 'chard', name: 'Richard Biaculo', role: 'Member' },
  ];
}
