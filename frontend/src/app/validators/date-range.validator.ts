import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const startDate = control.get('start_date')?.value;
        const endDate = control.get('end_date')?.value;

        if (startDate && endDate) {
            return startDate > endDate ? { dateRangeInvalid: true } : null;
        }
        return null;
    };
}
