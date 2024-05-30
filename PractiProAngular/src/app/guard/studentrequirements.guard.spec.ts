import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { studentrequirementsGuard } from './studentrequirements.guard';

describe('studentrequirementsGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => studentrequirementsGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
