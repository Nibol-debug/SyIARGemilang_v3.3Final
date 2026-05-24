import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const rolesData = [
    'Administrator Utama',
    'Kepala Diklat',
    'Instruktur',
    'Wali Kelas',
    'Bendahara',
    'Staf Sarpras',
    'Siswa',
    'Orang Tua'
  ];

  const roles = await Promise.all(
    rolesData.map(async (name) => {
      return prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    })
  );

  const adminRole = roles.find(r => r.name === 'Administrator Utama');

  if (adminRole) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { username: 'admin' },
      update: {
        role_id: adminRole.id,
        password_hash: hashedPassword,
      },
      create: {
        username: 'admin',
        password_hash: hashedPassword,
        role_id: adminRole.id,
      },
    });
  }

  const permissionsData = [
    'view_students', 'manage_students',
    'view_applicants', 'manage_applicants',
    'view_hrm', 'manage_hrm',
    'view_finance', 'manage_finance',
    'view_assets', 'manage_assets',
    'view_exams', 'manage_exams',
    'view_academic', 'manage_academic',
    'view_grades', 'manage_grades',
    'view_reports',
    'view_majors', 'manage_majors',
    'view_batches', 'manage_batches',
    'view_classes', 'manage_classes',
    'view_users', 'manage_users',
    'view_notifications',
  ];

  const permissions = await Promise.all(
    permissionsData.map(async (name) => {
      return prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    })
  );

  const rolePermissions: Record<string, string[]> = {
    'Administrator Utama': permissionsData,
    'Kepala Diklat': [
      'view_students', 'manage_students',
      'view_applicants', 'manage_applicants',
      'view_hrm',
      'view_finance',
      'view_assets',
      'view_exams',
      'view_academic', 'manage_academic',
      'view_grades',
      'view_reports',
      'view_majors',
      'view_batches',
      'view_classes',
    ],
    'Instruktur': [
      'view_students',
      'view_hrm',
      'view_exams', 'manage_exams',
      'view_academic', 'manage_academic',
      'view_grades', 'manage_grades',
      'view_reports',
    ],
    'Wali Kelas': [
      'view_students',
      'view_hrm',
      'view_exams',
      'view_finance',
      'view_academic',
      'view_grades',
    ],
    'Bendahara': [
      'view_students',
      'view_finance', 'manage_finance',
      'view_reports',
    ],
    'Staf Sarpras': [
      'view_assets', 'manage_assets',
    ],
    'Siswa': [
      'view_exams',
      'view_grades',
      'view_notifications',
    ],
    'Orang Tua': [
      'view_finance',
      'view_students',
      'view_grades',
      'view_notifications',
    ],
  };

  for (const role of roles) {
    const permNames = rolePermissions[role.name] || [];
    const rolePerms = permissions.filter(p => permNames.includes(p.name));
    await Promise.all(
      rolePerms.map(async (p) => {
        return prisma.rolePermission.upsert({
          where: {
            role_id_permission_id: {
              role_id: role.id,
              permission_id: p.id,
            },
          },
          update: {},
          create: {
            role_id: role.id,
            permission_id: p.id,
          },
        });
      })
    );
  }

  console.log('Seed data created successfully with 8 Proposal Roles and Permissions');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
