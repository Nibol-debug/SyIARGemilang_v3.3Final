import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.student.updateMany({
    where: { gender: { contains: 'Laki-laki' } },
    data: { gender: 'L' }
  });
  await prisma.student.updateMany({
    where: { gender: { contains: 'Perempuan' } },
    data: { gender: 'P' }
  });
  console.log('Gender data normalized');
}
main();
