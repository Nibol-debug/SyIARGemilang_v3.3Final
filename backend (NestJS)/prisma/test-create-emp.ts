import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const emp = await prisma.employee.create({
      data: {
        full_name: 'Test Employee',
        education: 'S1',
        position: 'Staff',
        join_date: new Date(),
        status: 'active'
      }
    });
    console.log('Success:', emp);
  } catch (err) {
    console.error('Error:', err);
  }
}
main();
