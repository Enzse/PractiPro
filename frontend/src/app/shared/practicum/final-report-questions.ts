/**
 * The final report questionnaire. The keys (p1q1, p2q1x1, ...) are the column
 * names in student_final_reports and what the coordinator's analytics count.
 */

export const CRITERIA = [
  { key: 'p1q1', text: 'My scope of work is directly related to the academic program I am pursuing.' },
  { key: 'p1q2', text: 'I was given an orientation on the company organization and operations.' },
  { key: 'p1q3', text: 'I was given a job description on my specific duties and reporting relationships.' },
  { key: 'p1q4', text: 'My office/work hours were clear and convenient for me.' },
  { key: 'p1q5', text: 'I felt safe and secure in my work location and environment.' },
  { key: 'p1q6', text: 'I had no difficulty going to and from work.' },
  { key: 'p1q7', text: 'The company provided me with an allowance, stipend, or subsidy.' },
] as const;

export const OBJECTIVES = [
  { key: 'p2q1', extent: 'p2q1x1' },
  { key: 'p2q2', extent: 'p2q2x1' },
  { key: 'p2q3', extent: 'p2q3x1' },
  { key: 'p2q4', extent: 'p2q4x1' },
  { key: 'p2q5', extent: 'p2q5x1' },
] as const;

export const EXTENTS = ['0', '25', '50', '75', '100'] as const;

export const RATINGS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'] as const;
