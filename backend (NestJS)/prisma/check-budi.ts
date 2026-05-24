import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const emp = await prisma.employee.findFirst({ where: { full_name: 'Budi Santoso' } });
  console.log(emp);
}
main();
