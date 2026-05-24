'use client';

import { useState, useEffect } from 'react';
import { getUserFromToken } from './utils';

export function useUserRole() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getUserFromToken());
  }, []);

  const role = user?.role || '';
  const permissions: string[] = user?.permissions || [];

  const hasPermission = (perm: string) => permissions.includes(perm);

  return {
    user,
    role,
    permissions,
    employeeId: user?.employeeId,
    studentId: user?.studentId,
    isAdmin: role === 'Administrator Utama',
    isStaff: ['Administrator Utama', 'Kepala Diklat'].includes(role),
    isTeacher: ['Administrator Utama', 'Instruktur', 'Wali Kelas', 'Kepala Diklat'].includes(role),
    isFinance: role === 'Bendahara',
    isStudent: role === 'Siswa',
    isParent: role === 'Orang Tua',

    // Permission-based helpers
    canManageStudents: hasPermission('manage_students'),
    canManageEmployees: hasPermission('manage_hrm'),
    canManageExams: hasPermission('manage_exams'),
    canManageGrades: hasPermission('manage_grades'),
    canManageFinance: hasPermission('manage_finance'),
    canManageAssets: hasPermission('manage_assets'),
    canManageUsers: hasPermission('manage_users'),
    canManageAcademic: hasPermission('manage_academic'),
    canViewStudents: hasPermission('view_students'),
    canViewOnly: !hasPermission('manage_students') && !hasPermission('manage_users') && !hasPermission('manage_hrm') && !hasPermission('manage_finance') && !hasPermission('manage_academic') && !hasPermission('manage_assets'),
    hasPermission,
  };
}
