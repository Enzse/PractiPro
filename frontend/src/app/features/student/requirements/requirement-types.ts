import { StudentRequirements } from '../../../core/models/student';

export interface RequirementType {
  /** Stored as submission_name; the requirements view matches on these exact values. */
  code: string;
  label: string;
  /** The column of vw_student_requirements that says whether it is approved. */
  field: keyof StudentRequirements;
  /** A template in assets/pdfTemplates students can fill in. */
  template?: string;
}

/** The documents a student must have approved before the practicum starts. */
export const REQUIREMENT_TYPES: readonly RequirementType[] = [
  { code: 'Resume', label: 'Resume', field: 'resume' },
  { code: 'ApplicationLetter', label: 'Application letter', field: 'application_letter', template: 'Application_Letter.docx' },
  { code: 'AcceptanceLetter', label: 'Acceptance letter', field: 'acceptance_letter', template: 'Acceptance_Letter.docx' },
  { code: 'EndorsementLetter', label: 'Endorsement letter', field: 'endorsement_letter' },
  { code: "Parent's", label: 'Parent or guardian waiver', field: 'guardians_waiver', template: 'Parents_Waiver.docx' },
  { code: 'VaccinationCard', label: 'Vaccination card', field: 'vaccination_card' },
  { code: 'BarangayClearance', label: 'Barangay clearance', field: 'barangay_clearance' },
  { code: 'MedicalCertificate', label: 'Medical certificate', field: 'medical_certificate' },
];

export function requirementLabel(code: string | undefined): string {
  return REQUIREMENT_TYPES.find((type) => type.code === code)?.label ?? code ?? '';
}
