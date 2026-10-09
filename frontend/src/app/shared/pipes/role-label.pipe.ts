import { Pipe, PipeTransform } from '@angular/core';

const LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  advisor: 'Coordinator',
  student: 'Student',
  supervisor: 'Supervisor',
};

/**
 * Shows a role code as people read it: the coordinator role is stored as
 * 'advisor', but the app calls it "Coordinator".
 */
@Pipe({ name: 'roleLabel' })
export class RoleLabelPipe implements PipeTransform {
  transform(role: string | null | undefined): string {
    return role ? (LABELS[role] ?? role) : '';
  }
}
