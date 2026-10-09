import { StudentOjtStatus } from '../../../core/models/student';

const TRAINING_HOURS = 200;
const SEMINAR_HOURS = 50;

export interface StudentFilter {
  value: string;
  label: string;
  /** Short chip label, if different. */
  chip?: string;
  matches: (student: StudentOjtStatus) => boolean;
}

/**
 * Ways to narrow a class's student list. The stages from "registered" on are
 * the practicum's steps, in order (the overview's progress chart uses them too).
 */
export const STUDENT_FILTERS: readonly StudentFilter[] = [
  { value: 'not-registered', label: 'Still registering', chip: 'Registering', matches: (s) => s.registration_status !== 1 },
  { value: 'registered', label: 'Requirements approved', chip: 'Registered', matches: (s) => s.registration_status === 1 },
  { value: 'placed', label: 'Placed at a company', chip: 'Placed', matches: (s) => !!s.company_id },
  { value: 'hours', label: `${TRAINING_HOURS} training hours`, chip: `${TRAINING_HOURS} h`, matches: (s) => Number(s.TotalHoursWorked ?? 0) >= TRAINING_HOURS },
  { value: 'seminars', label: `${SEMINAR_HOURS} seminar hours`, chip: `${SEMINAR_HOURS} seminar h`, matches: (s) => Number(s.TotalSeminarHours ?? 0) >= SEMINAR_HOURS },
  { value: 'evaluated', label: 'Evaluation approved', chip: 'Evaluated', matches: (s) => s.evaluation_status === 'Completed!' },
  { value: 'final-report', label: 'Final report approved', chip: 'Final report', matches: (s) => s.exitpoll_status === 'Completed!' },
  {
    value: 'completed',
    label: 'Completed',
    matches: (s) =>
      Number(s.TotalHoursWorked ?? 0) >= TRAINING_HOURS &&
      Number(s.TotalSeminarHours ?? 0) >= SEMINAR_HOURS &&
      s.evaluation_status === 'Completed!' &&
      s.exitpoll_status === 'Completed!',
  },
];

export { TRAINING_HOURS, SEMINAR_HOURS };
