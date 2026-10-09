import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.value;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

  if (password.length < 8) {
    return { 'shortPassword': true };
  }

  if (!regex.test(password)) {
    return { 'weakPassword': true };
  }

  return null;
}
