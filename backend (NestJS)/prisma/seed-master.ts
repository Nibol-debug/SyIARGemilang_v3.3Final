import { PrismaClient, Major, Branch, Batch } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding RGI master data...');

  // 1. Seed Branches (Cabang)
  const branchesData = [
    { name: 'Depok' },
    { name: 'Surabaya' },
    { name: 'Jakarta' },
  ];

  const branches: Branch[] = [];
  for (const b of branchesData) {
    const branch = await prisma.branch.upsert({
      where: { name: b.name },
      update: {},
      create: { name: b.name },
    });
    branches.push(branch);
    console.log(`Branch: ${branch.name}`);
  }

  const depok = branches.find(b => b.name === 'Depok');
  const surabaya = branches.find(b => b.name === 'Surabaya');
  const jakarta = branches.find(b => b.name === 'Jakarta');

  if (!depok || !surabaya || !jakarta) throw new Error('Branches not found after seeding');

  // 2. Seed Majors (Jurusan - English names)
  const majorsData = [
    // Depok
    { code: 'FD-DPK', name: 'Fashion Design', branch_id: depok.id },
    { code: 'GD-DPK', name: 'Graphic Design', branch_id: depok.id },
    
    // Surabaya
    { code: 'SE-SBY', name: 'Software Engineering', branch_id: surabaya.id },
    
    // Jakarta
    { code: 'DBS-JKT', name: 'Digital Business Specialist', branch_id: jakarta.id },
  ];

  const majors: Major[] = [];
  for (const m of majorsData) {
    const major = await prisma.major.upsert({
      where: { code: m.code },
      update: { name: m.name, branch_id: m.branch_id },
      create: { code: m.code, name: m.name, branch_id: m.branch_id },
    });
    majors.push(major);
    console.log(`Major: ${major.code} - ${major.name} (${major.branch_id})`);
  }

  // 3. Seed Batches (RGI 6-month cycles, using numbers)
  // We use findFirst + create/update because 'name' is not unique in schema
  const batchesData = [
    { name: '34', start_date: new Date('2026-01-01'), end_date: new Date('2026-06-30'), is_active: true },
    { name: '35', start_date: new Date('2026-07-01'), end_date: new Date('2026-12-31'), is_active: false },
  ];

  const batches: Batch[] = [];
  for (const b of batchesData) {
    let batch = await prisma.batch.findFirst({ where: { name: b.name } });
    if (!batch) {
      batch = await prisma.batch.create({ data: b });
    } else {
      batch = await prisma.batch.update({ 
        where: { id: batch.id }, 
        data: {
          start_date: b.start_date,
          end_date: b.end_date,
          is_active: b.is_active
        } 
      });
    }
    batches.push(batch);
    console.log(`Batch: ${batch.name} (${batch.start_date.toISOString()} - ${batch.end_date.toISOString()})`);
  }
  
  const batch34 = batches.find(b => b.name === '34');
  if (!batch34) throw new Error('Batch 34 not found');

  // 4. Seed Classes for Batch 34
  const fdDepok = majors.find((m) => m.code === 'FD-DPK');
  const seSurabaya = majors.find((m) => m.code === 'SE-SBY');
  const dbsJakarta = majors.find((m) => m.code === 'DBS-JKT');

  if (!fdDepok || !seSurabaya || !dbsJakarta) {
    throw new Error('Some majors not found after seeding');
  }

  const classesData = [
    { name: '34 FD DPK 1', grade_level: 1, major_id: fdDepok.id, batch_id: batch34.id },
    { name: '34 SE SBY 1', grade_level: 1, major_id: seSurabaya.id, batch_id: batch34.id },
    { name: '34 DBS JKT 1', grade_level: 1, major_id: dbsJakarta.id, batch_id: batch34.id },
  ];

  for (const c of classesData) {
    const existingClass = await prisma.class.findFirst({
      where: {
        name: c.name,
        major_id: c.major_id,
        batch_id: c.batch_id,
      },
    });

    if (!existingClass) {
      const newClass = await prisma.class.create({
        data: c,
      });
      console.log(`Class Created: ${newClass.name}`);
    } else {
      console.log(`Class Exists: ${existingClass.name}`);
    }
  }

  console.log('RGI Master data seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
