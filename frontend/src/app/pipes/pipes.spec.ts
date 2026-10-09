import { DayPipe } from './day.pipe';
import { FilterPipe } from './filter.pipe';
import { OrdinalPipe } from './ordinal.pipe';
import { TimePipe } from './time.pipe';

describe('DayPipe', () => {
  const pipe = new DayPipe();

  it('abbreviates day names', () => {
    expect(pipe.transform('Wednesday')).toBe('Wed');
  });

  it('leaves anything else unchanged', () => {
    expect(pipe.transform('Holiday')).toBe('Holiday');
  });
});

describe('FilterPipe', () => {
  const pipe = new FilterPipe();
  const users = [
    { firstName: 'Ana', lastName: 'Reyes', role: 'student' },
    { firstName: 'Ben', lastName: 'Cruz', role: 'advisor' },
  ];

  it('keeps rows whose values contain the search text, ignoring case', () => {
    expect(pipe.transform(users, 'REY')).toEqual([users[0]]);
    expect(pipe.transform(users, 'advisor')).toEqual([users[1]]);
  });

  it('does not match field names', () => {
    expect(pipe.transform(users, 'name')).toEqual([]);
  });

  it('returns everything when there is no search text', () => {
    expect(pipe.transform(users, '')).toBe(users);
  });
});

describe('OrdinalPipe', () => {
  const pipe = new OrdinalPipe();

  it('adds the right suffix', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 101, 111].map((n) => pipe.transform(n)))
      .toEqual(['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '101st', '111th']);
  });
});

describe('TimePipe', () => {
  const pipe = new TimePipe();

  it('formats 24-hour times as 12-hour times', () => {
    expect(pipe.transform('08:05:00', '17:00:00')).toBe('8:05 AM');
    expect(pipe.transform('13:30:00', '17:00:00')).toBe('1:30 PM');
    expect(pipe.transform('00:15:00', '01:00:00')).toBe('12:15 AM');
    expect(pipe.transform('12:00:00', '17:00:00')).toBe('12:00 PM');
  });

  it('shows "No work" for a day without hours', () => {
    expect(pipe.transform('00:00:00', '00:00:00')).toBe('No work');
  });
});
