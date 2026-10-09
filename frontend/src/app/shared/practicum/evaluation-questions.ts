/**
 * The supervisor's performance evaluation of a student. The keys (p1q1, p5q6x1, ...)
 * are the columns of student_supervisor_evaluation and what the analytics count.
 * Rated items use 1 (lowest) to 5 (highest).
 */

export interface RatedSection {
  title: string;
  items: { key: string; text: string }[];
}

export const RATED_SECTIONS: RatedSection[] = [
  {
    title: 'Knowledge',
    items: [
      { key: 'p1q1', text: 'Identifies problems, gathers data related to the problem, analyzes the data gathered and selects appropriate actions.' },
      { key: 'p1q2', text: 'Sets priorities in the workplace based on the identified needs.' },
      { key: 'p1q3', text: 'Formulates plans based on priority needs and problems in the workplace.' },
      { key: 'p1q4', text: 'Promotes safety measures in all aspects of the job assigned to him/her.' },
      { key: 'p1q5', text: 'Applies appropriate IT/CS principles on the tasks on hand.' },
    ],
  },
  {
    title: 'Skills',
    items: [
      { key: 'p2q1', text: 'Analyzes the tasks assigned to him/her.' },
      { key: 'p2q2', text: 'Works with thoroughness and accuracy, orderliness and neatness.' },
      { key: 'p2q3', text: 'Sets systematic objectives in their order of priority.' },
      { key: 'p2q4', text: 'Has the initiative and ingenuity in finding ways and means to accomplish objectives.' },
      { key: 'p2q5', text: 'Relates IT/CS principles correctly to the assigned task.' },
      { key: 'p2q6', text: 'Prepares and administers necessary and appropriate evaluation for the accomplished work.' },
      { key: 'p2q7', text: 'Maintains accurate and updated documentation of the work done.' },
      { key: 'p2q8', text: 'Provides safety measures for the prevention of accidents.' },
    ],
  },
  {
    title: 'Attitude',
    items: [
      { key: 'p3q1', text: 'Reports in the workplace on time regularly.' },
      { key: 'p3q2', text: 'Never leaves the area without permission from his/her superior.' },
      { key: 'p3q3', text: 'Practices good grooming.' },
      { key: 'p3q4', text: 'Carries self with dignity and respect, projects a positive self-image.' },
      { key: 'p3q5', text: 'Observes personal and professional decorum.' },
      { key: 'p3q6', text: 'Establishes friendliness but not familiarity.' },
      { key: 'p3q7', text: 'Gives due respect to the superiors; always tactful in dealing with them.' },
      { key: 'p3q8', text: 'Behaves in accordance with the set policies and standards of the university and company.' },
      { key: 'p3q9', text: 'Works collaboratively and cooperates with other members of the company as necessary.' },
      { key: 'p3q10', text: 'Works harmoniously with others towards overall efficiency of the organization.' },
      { key: 'p3q11', text: 'Accepts constructive criticisms and suggestions given by superior and co-worker.' },
      { key: 'p3q12', text: 'Helps in keeping the immediate environment clean and orderly.' },
      { key: 'p3q13', text: 'Submits requirements on time.' },
    ],
  },
];

export const OVERALL_RATINGS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'] as const;

/** Part 5: the supervisor's written comments. */
export const COMMENT_QUESTIONS = [
  { key: 'p5q1', text: 'The student’s major strong points are' },
  { key: 'p5q2', text: 'These might be utilized more effectively by' },
  { key: 'p5q3', text: 'The student’s major weak points are' },
  { key: 'p5q4', text: 'These might be corrected by' },
  { key: 'p5q5', text: 'Other comments or suggestions' },
] as const;

/** p5q6x1 is yes/no; p5q6 holds the explanation. */
export const RECOMMEND_QUESTION = { key: 'p5q6x1', reasonKey: 'p5q6', text: 'Would you recommend this student for further employment in your own firm?' } as const;
