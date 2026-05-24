import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const students = await prisma.student.findMany({ select: { id: true, full_name: true, gender: true } });
  console.log(students);
}
main();
