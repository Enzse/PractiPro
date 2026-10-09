import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function emailDomainValidator(domain: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value;
    if (email && email.indexOf('@') != -1) {
      const [_, emailDomain] = email.split('@');
      if (emailDomain !== domain) {
        return { emailDomain: true };
      }
    }
    return null;
  };
}
