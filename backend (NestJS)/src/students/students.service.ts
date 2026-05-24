import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import * as QRCode from 'qrcode';
import * as ExcelJS from 'exceljs';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';

@Injectable()
export class StudentsService {
  private importConfig: any = null;

  constructor(private prisma: PrismaService) {}

  private loadImportConfig(): any {
    if (this.importConfig) return this.importConfig;
    const configPath = path.resolve(process.cwd(), 'import-config.json');
    this.importConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return this.importConfig;
  }

  private detectColumnIndex(headers: string[], keywords: string[]): number {
    const searchNames = headers.map(h => h?.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '') || '');
    for (const keyword of keywords) {
      const kw = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
      const idx = searchNames.findIndex(h => h.includes(kw) || kw.includes(h));
      if (idx >= 0) return idx;
    }
    return -1;
  }

  private detectColumns(headers: string[]): Record<string, number> {
    const config = this.loadImportConfig();
    const columns: Record<string, number> = {};
    for (const [field, keywords] of Object.entries(config.column_keywords)) {
      columns[field] = this.detectColumnIndex(headers, keywords as string[]);
    }
    return columns;
  }

  private parseBranch(text: string): string {
    if (!text) return '';
    const cleaned = text.trim();
    if (cleaned.includes(',')) {
      const parts = cleaned.split(',').map(s => s.trim()).filter(Boolean);
      return parts[parts.length - 1];
    }
    const words = cleaned.split(/\s+/);
    return words[words.length - 1];
  }

  private async resolveBranch(branchText: string): Promise<{ id: string; name: string; code: string } | null> {
    const parsedName = this.parseBranch(branchText);
    if (!parsedName) return null;

    let branch = await this.prisma.branch.findFirst({
      where: { name: { contains: parsedName,  } }
    });

    if (!branch) {
      branch = await this.prisma.branch.findFirst({
        where: { name: { contains: branchText.trim(),  } }
      });
    }

    if (!branch) {
      const words = branchText.trim().split(/[\s,]+/).filter(Boolean);
      for (const word of words) {
        if (word.length < 3) continue;
        branch = await this.prisma.branch.findFirst({
          where: { name: { contains: word,  } }
        });
        if (branch) break;
      }
    }

    if (!branch) {
      try {
        branch = await this.prisma.branch.create({ data: { name: parsedName } });
      } catch {
        branch = await this.prisma.branch.findFirst({
          where: { name: { contains: parsedName,  } }
        });
      }
    }

    if (!branch) return null;

    const config = this.loadImportConfig();
    const code = config.nis_code?.branch?.[branch.name] || '00';
    return { id: branch.id, name: branch.name, code };
  }

  private async resolveMajor(majorText: string, branchId: string): Promise<{ id: string; name: string; code: string } | null> {
    if (!majorText) return null;
    const cleaned = majorText.trim();

    const config = this.loadImportConfig();
    const mappedName = config.major_name_mapping?.[cleaned] || cleaned;

    let major = await this.prisma.major.findFirst({
      where: { name: mappedName, branch_id: branchId }
    });

    if (!major) {
      major = await this.prisma.major.findFirst({
        where: { name: { contains: mappedName }, branch_id: branchId }
      });
    }

    if (!major) {
      major = await this.prisma.major.findFirst({
        where: { name: { contains: cleaned }, branch_id: branchId }
      });
    }

    if (!major) {
      major = await this.prisma.major.findFirst({
        where: { name: mappedName }
      });
    }

    if (!major) {
      major = await this.prisma.major.findFirst({
        where: { name: { contains: mappedName } }
      });
    }

    if (!major) {
      major = await this.prisma.major.findFirst({
        where: { name: { contains: cleaned } }
      });
    }

    if (!major) {
      const latestMajor = await this.prisma.major.findFirst({
        where: { branch_id: branchId },
        orderBy: { created_at: 'desc' },
        select: { code: true }
      });
      let num = 1;
      if (latestMajor) {
        const match = latestMajor.code?.match(/(\d+)$/);
        num = match ? parseInt(match[1]) + 1 : 1;
      }
      const autoCode = `AUTO${num}`;

      try {
        major = await this.prisma.major.create({
          data: { code: autoCode, name: mappedName, branch_id: branchId },
        });
      } catch {
        major = await this.prisma.major.findFirst({
          where: { name: mappedName }
        });
      }
    }

    if (!major) return null;

    const nisCode = config.nis_code?.major?.[major.name] || '00';
    return { id: major.id, name: major.name, code: nisCode };
  }

  private async resolveClass(majorId: string, batchId: string): Promise<{ id: string; name: string } | null> {
    let studentClass = await this.prisma.class.findFirst({
      where: { major_id: majorId, batch_id: batchId },
    });

    if (!studentClass) {
      const major = await this.prisma.major.findUnique({ where: { id: majorId } });
      const batch = await this.prisma.batch.findUnique({ where: { id: batchId } });
      if (major && batch) {
        const shortName = major.name
          .replace(/[^a-zA-Z0-9 ]/g, '')
          .split(/\s+/)
          .map(w => w[0])
          .join('')
          .toUpperCase()
          .substring(0, 4);
        const className = `${batch.name} ${shortName} 1`;
        try {
          studentClass = await this.prisma.class.create({
            data: {
              name: className,
              grade_level: 1,
              major_id: majorId,
              batch_id: batchId,
            },
          });
        } catch {
          studentClass = await this.prisma.class.findFirst({
            where: { major_id: majorId, batch_id: batchId },
          });
        }
      }
    }

    return studentClass ? { id: studentClass.id, name: studentClass.name } : null;
  }

  private async generateNis(branchCode: string, majorCode: string, batchName: string, sequence: number): Promise<string> {
    const year = new Date().getFullYear().toString().substring(2);
    const bb = batchName.padStart(2, '0').substring(0, 2);
    const mm = majorCode.padStart(2, '0').substring(0, 2);
    const cc = branchCode.padStart(2, '0').substring(0, 2);
    const ss = sequence.toString().padStart(2, '0').substring(0, 2);
    return `${year}${bb}${mm}${cc}${ss}`;
  }

  private async getNextSequence(batchName: string, majorCode: string, branchCode: string): Promise<number> {
    const year = new Date().getFullYear().toString().substring(2);
    const prefix = `${year}${batchName.padStart(2, '0')}${majorCode}${branchCode}`;
    const lastStudent = await this.prisma.student.findFirst({
      where: { nis: { startsWith: prefix } },
      orderBy: { nis: 'desc' },
      select: { nis: true },
    });
    if (lastStudent) {
      const seqStr = lastStudent.nis.substring(8);
      const seq = parseInt(seqStr, 10);
      return isNaN(seq) ? 1 : seq + 1;
    }
    return 1;
  }

  private detectFileType(file: Express.Multer.File): 'xlsx' | 'csv' {
    const name = file.originalname?.toLowerCase() || '';
    const mimetype = file.mimetype?.toLowerCase() || '';
    if (name.endsWith('.csv') || mimetype.includes('csv') || mimetype === 'text/csv') return 'csv';
    return 'xlsx';
  }

  private async parseXlsx(file: Express.Multer.File): Promise<{ headers: string[]; rows: string[][] }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new Error('Worksheet tidak ditemukan');

    const rows: string[][] = [];
    worksheet.eachRow((row, rowNumber) => {
      const values: string[] = [];
      row.eachCell((cell) => { values.push(cell.value?.toString() || ''); });
      rows.push(values);
    });

    if (rows.length === 0) throw new Error('File Excel kosong');
    const headers = rows[0];
    const dataRows = rows.slice(1).filter(r => r.some(c => c.trim() !== ''));
    return { headers, rows: dataRows };
  }

  private async parseCsv(file: Express.Multer.File): Promise<{ headers: string[]; rows: string[][] }> {
    const content = file.buffer.toString('utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) throw new Error('File CSV kosong');

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuote = !inQuote; continue; }
        if (ch === ',' && !inQuote) { result.push(current.trim()); current = ''; continue; }
        current += ch;
      }
      result.push(current.trim());
      return result;
    };

    const rows = lines.map(parseLine);
    const headers = rows[0];
    const dataRows = rows.slice(1).filter(r => r.some(c => c.trim() !== ''));
    return { headers, rows: dataRows };
  }

  private async parseFile(file: Express.Multer.File): Promise<{ headers: string[]; rows: string[][] }> {
    const type = this.detectFileType(file);
    return type === 'csv' ? this.parseCsv(file) : this.parseXlsx(file);
  }

  async importPreview(file: Express.Multer.File, batchId?: string): Promise<any> {
    const { headers, rows } = await this.parseFile(file);
    const cols = this.detectColumns(headers);

    if (cols.nis < 0 && cols.full_name < 0) {
      throw new Error('Tidak dapat mendeteksi kolom. Pastikan header Excel berisi: NIS, Nama lengkap, Jurusan');
    }

    let batch: any = null;
    if (batchId) {
      batch = await this.prisma.batch.findUnique({ where: { id: batchId } });
    } else {
      batch = await this.prisma.batch.findFirst({ where: { is_active: true } });
    }

    const previewRows: any[] = [];
    let newCount = 0;
    let updateCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nis = cols.nis >= 0 ? (row[cols.nis]?.toString().trim() || '') : '';
      const fullName = cols.full_name >= 0 ? (row[cols.full_name]?.toString().trim() || '') : '';
      const majorText = cols.major >= 0 ? (row[cols.major]?.toString().trim() || '') : '';
      const branchText = cols.branch >= 0 ? (row[cols.branch]?.toString().trim() || '') : '';
      const notes = cols.notes >= 0 ? (row[cols.notes]?.toString().trim() || '') : '';

      const errors: string[] = [];
      if (!fullName) errors.push('Nama kosong');

      let branchInfo: { id: string; name: string; code: string } | null = null;
      if (branchText) {
        branchInfo = await this.resolveBranch(branchText);
        if (!branchInfo) errors.push(`Cabang "${branchText}" tidak ditemukan`);
      }

      let majorInfo: { id: string; name: string; code: string } | null = null;
      if (majorText && branchInfo) {
        majorInfo = await this.resolveMajor(majorText, branchInfo.id);
        if (!majorInfo) errors.push(`Jurusan "${majorText}" tidak ditemukan`);
      }

      let classInfo: { id: string; name: string } | null = null;
      if (majorInfo && batch) {
        classInfo = await this.resolveClass(majorInfo.id, batch.id);
      }

      let status = 'baru';
      if (nis) {
        const existing = await this.prisma.student.findUnique({ where: { nis } });
        if (existing) status = 'update';
      }

      if (errors.length > 0) status = 'error';

      if (status === 'baru') newCount++;
      else if (status === 'update') updateCount++;

      previewRows.push({
        rowNumber: i + 2,
        nis: nis || '(auto)',
        full_name: fullName,
        major_name: majorInfo?.name || majorText || '-',
        branch_name: branchInfo?.name || branchText || '-',
        class_name: classInfo?.name || '-',
        status,
        errors,
        resolved: {
          branch_id: branchInfo?.id || null,
          major_id: majorInfo?.id || null,
          class_id: classInfo?.id || null,
          branch_code: branchInfo?.code || '00',
          major_code: majorInfo?.code || '00',
        },
      });
    }

    return {
      rows: previewRows,
      total: previewRows.length,
      new_count: newCount,
      update_count: updateCount,
      error_count: previewRows.filter(r => r.status === 'error').length,
      batch_id: batch?.id || null,
      batch_name: batch?.name || null,
    };
  }

  async importFromExcel(file: Express.Multer.File, batchId?: string) {
    const { headers, rows } = await this.parseFile(file);
    const cols = this.detectColumns(headers);

    if (cols.nis < 0 && cols.full_name < 0) {
      throw new Error('Tidak dapat mendeteksi kolom. Pastikan header Excel berisi: NIS, Nama lengkap, Jurusan');
    }

    let batch: any = null;
    if (batchId) {
      batch = await this.prisma.batch.findUnique({ where: { id: batchId } });
    } else {
      batch = await this.prisma.batch.findFirst({ where: { is_active: true } });
    }
    if (!batch) throw new Error('Tidak ada batch aktif. Pilih batch terlebih dahulu.');

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    const config = this.loadImportConfig();
    const defaults = config.defaults || {};

    for (const row of rows) {
      try {
        const nis = cols.nis >= 0 ? (row[cols.nis]?.toString().trim() || '') : '';
        const fullName = cols.full_name >= 0 ? (row[cols.full_name]?.toString().trim() || '') : '';
        const majorText = cols.major >= 0 ? (row[cols.major]?.toString().trim() || '') : '';
        const branchText = cols.branch >= 0 ? (row[cols.branch]?.toString().trim() || '') : '';

        if (!fullName) { skipped++; continue; }

        let branchInfo: { id: string; name: string; code: string } | null = null;
        if (branchText) branchInfo = await this.resolveBranch(branchText);

        let majorInfo: { id: string; name: string; code: string } | null = null;
        if (majorText && branchInfo) majorInfo = await this.resolveMajor(majorText, branchInfo.id);

        let classInfo: { id: string; name: string } | null = null;
        if (majorInfo) classInfo = await this.resolveClass(majorInfo.id, batch.id);

        const finalNis = nis || await this.generateNis(
          branchInfo?.code || '00',
          majorInfo?.code || '00',
          batch.name,
          await this.getNextSequence(batch.name, majorInfo?.code || '00', branchInfo?.code || '00'),
        );

        const email = cols.email >= 0 && row[cols.email]?.toString().trim()
          ? row[cols.email]!.toString().trim()
          : `${finalNis}${defaults.email_suffix || '@rgi.sch.id'}`;

        const gender = defaults.gender || 'L';
        const birthPlace = defaults.birth_place || '-';
        const address = defaults.address || '-';
        const phone = defaults.phone || '-';

        const studentData: any = {
          full_name: fullName,
          email,
          gender,
          birth_place: birthPlace,
          birth_date: new Date(),
          address,
          phone,
          status: 'active',
        };

        if (branchInfo) studentData.branch_id = branchInfo.id;
        if (majorInfo) studentData.major_id = majorInfo.id;
        if (classInfo) studentData.class_id = classInfo.id;
        if (batch) studentData.batch_id = batch.id;

        const existingStudent = await this.prisma.student.findUnique({ where: { nis: finalNis } });

        if (existingStudent) {
          await this.prisma.student.update({
            where: { nis: finalNis },
            data: {
              full_name: fullName,
              email,
              branch_id: branchInfo?.id || existingStudent.branch_id,
              class_id: classInfo?.id || existingStudent.class_id,
              major_id: majorInfo?.id || existingStudent.major_id,
              batch_id: batch?.id || existingStudent.batch_id,
            },
          });
        } else {
          studentData.nis = finalNis;
          studentData.nik = finalNis;
          studentData.qr_code = await QRCode.toDataURL(finalNis);
          studentData.histories = {
            create: {
              type: 'masuk',
              description: 'Impor data siswa',
              date: new Date(),
            },
          };

          const student = await this.prisma.student.create({ data: studentData as any });

          const studentRole = await this.prisma.role.findUnique({ where: { name: 'Siswa' } });
          if (studentRole) {
            const hashedPassword = await bcrypt.hash(defaults.password || 'rgi123', 10);
            await this.prisma.user.upsert({
              where: { username: finalNis },
              update: { student_id: student.id, role_id: studentRole.id },
              create: {
                username: finalNis,
                password_hash: hashedPassword,
                role_id: studentRole.id,
                student_id: student.id,
              },
            });
          }
        }

        imported++;
      } catch (err: any) {
        skipped++;
        errors.push(`Baris ${rows.indexOf(row) + 2}: ${err.message}`);
      }
    }

    return { imported, skipped, errors: errors.slice(0, 10) };
  }

  async finalizeRegistration(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { applicant: true, major: true, batch: true },
    });

    if (!student) throw new NotFoundException('Student not found');
    if (student.status === 'active') return student;

    // Generate real NIS: e.g., BatchYear + MajorCode + RandomSuffix
    const year = student.batch.start_date.getFullYear().toString().substring(2);
    const majorCode = student.major.code.replace(/[^A-Z]/g, '').substring(0, 3);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const finalNis = `${year}${majorCode}${randomSuffix}`;

    // Create User account
    const hashedPassword = await bcrypt.hash('rgi123', 10);
    const studentRole = await this.prisma.role.findUnique({ where: { name: 'Siswa' } });
    
    if (studentRole) {
      await this.prisma.user.upsert({
        where: { username: finalNis },
        update: {
          student_id: student.id,
          role_id: studentRole.id,
        },
        create: {
          username: finalNis,
          password_hash: hashedPassword,
          role_id: studentRole.id,
          student_id: student.id,
        },
      });
    }

    // Update Student
    const updatedStudent = await this.prisma.student.update({
      where: { id },
      data: {
        nis: finalNis,
        status: 'active',
        qr_code: await QRCode.toDataURL(finalNis),
        histories: {
          create: {
            type: 'active',
            description: 'Pendaftaran difinalisasi. NIS diterbitkan.',
            date: new Date(),
          }
        }
      },
    });

    // Update Applicant status
    if (student.applicant_id) {
      await this.prisma.applicant.update({
        where: { id: student.applicant_id },
        data: { status: 'registered' },
      });
    }

    return updatedStudent;
  }

  async create(createStudentDto: CreateStudentDto) {
    const { parents, ...studentData } = createStudentDto;

    // Force major_id and batch_id to follow class if class_id is provided
    if (studentData.class_id) {
      const selectedClass = await this.prisma.class.findUnique({
        where: { id: studentData.class_id },
        include: { major: true }
      });
      
      if (!selectedClass) {
        throw new NotFoundException(`Class with ID ${studentData.class_id} not found`);
      }

      studentData.major_id = selectedClass.major_id;
      studentData.batch_id = selectedClass.batch_id;
      studentData.branch_id = selectedClass.major.branch_id;
    }

    // If still missing required IDs, try to fill from first available
    if (!studentData.branch_id || !studentData.major_id || !studentData.batch_id) {
      // Try to get defaults from the first available class or major
      const firstClass = await this.prisma.class.findFirst({ include: { major: true } });
      if (firstClass) {
        if (!studentData.branch_id) studentData.branch_id = firstClass.major.branch_id;
        if (!studentData.major_id) studentData.major_id = firstClass.major_id;
        if (!studentData.batch_id) studentData.batch_id = firstClass.batch_id;
      } else {
        // Fallback: get first branch, major, batch separately
        if (!studentData.branch_id) {
          const branch = await this.prisma.branch.findFirst();
          if (branch) studentData.branch_id = branch.id;
        }
        if (!studentData.major_id) {
          const major = await this.prisma.major.findFirst();
          if (major) studentData.major_id = major.id;
        }
        if (!studentData.batch_id) {
          const batch = await this.prisma.batch.findFirst();
          if (batch) studentData.batch_id = batch.id;
        }
      }
    }

    // Generate QR Code content (NIS)
    const qrCodeBase64 = await QRCode.toDataURL(studentData.nis);

    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          ...studentData,
          qr_code: qrCodeBase64,
          parents: parents ? {
            create: parents
          } : undefined,
          histories: {
            create: {
              type: 'masuk',
              description: 'Siswa baru terdaftar',
              date: new Date(),
            }
          }
        } as any,
        include: {
          parents: true,
          histories: true,
        }
      });

      // Auto-create user account for student
      try {
        const studentRole = await tx.role.findUnique({ where: { name: 'Siswa' } });
        if (studentRole) {
          const hashedPassword = await bcrypt.hash('rgi123', 10);
          await tx.user.upsert({
            where: { username: studentData.nis },
            update: {
              student_id: student.id,
              role_id: studentRole.id,
            },
            create: {
              username: studentData.nis,
              password_hash: hashedPassword,
              role_id: studentRole.id,
              student_id: student.id,
            },
          });
        }
      } catch (err) {
        console.error('Auto-create user for student failed:', err);
      }

      return student;
    });
  }

  async findAll(pagination: PaginationDto, filters: { class_id?: string; major_id?: string; batch_id?: string; branch_id?: string; search?: string }) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { ...filters };
    if (filters.search) {
      where.OR = [
        { full_name: { contains: filters.search } },
        { nis: { contains: filters.search } },
      ];
      delete where.search;
    }

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          class: true,
          major: true,
          batch: true,
          branch: true,
          parents: true,
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
        major: true,
        batch: true,
        branch: true,
        parents: true,
        histories: true,
      },
    });
    if (!student) throw new NotFoundException(`Student with ID ${id} not found`);
    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const { parents, ...studentData } = updateStudentDto;
    
    // Get current student to check status change
    const currentStudent = await this.prisma.student.findUnique({ where: { id } });
    if (!currentStudent) throw new NotFoundException(`Student with ID ${id} not found`);

    const data: any = { ...studentData };

    // Force major_id and batch_id to follow class if class_id is provided or changed
    if (studentData.class_id) {
      const selectedClass = await this.prisma.class.findUnique({
        where: { id: studentData.class_id },
        include: { major: true }
      });
      
      if (!selectedClass) {
        throw new NotFoundException(`Class with ID ${studentData.class_id} not found`);
      }

      data.major_id = selectedClass.major_id;
      data.batch_id = selectedClass.batch_id;
      data.branch_id = selectedClass.major.branch_id;
    }

    // Regenerate QR Code if NIS changed
    if (studentData.nis && studentData.nis !== currentStudent.nis) {
      data.qr_code = await QRCode.toDataURL(studentData.nis);
    }

    if (parents) {
      data.parents = {
        deleteMany: {},
        create: parents,
      };
    }

    // Add history if status changed
    if (studentData.status && studentData.status !== currentStudent.status) {
      data.histories = {
        create: {
          type: studentData.status,
          description: `Status diubah dari ${currentStudent.status} ke ${studentData.status}`,
          date: new Date(),
        }
      };
    }
    
    return this.prisma.student.update({
      where: { id },
      data,
      include: { parents: true, histories: true, branch: true }
    });
  }

  async remove(id: string) {
    return this.prisma.student.delete({
      where: { id },
    });
  }

  private buildExportFilter(filters: { branch_id?: string; major_id?: string; class_id?: string; batch_id?: string }): any {
    const where: any = {};
    if (filters.branch_id) where.branch_id = filters.branch_id;
    if (filters.major_id) where.major_id = filters.major_id;
    if (filters.class_id) where.class_id = filters.class_id;
    if (filters.batch_id) where.batch_id = filters.batch_id;
    return where;
  }

  async exportPreview(filters: { branch_id?: string; major_id?: string; class_id?: string; batch_id?: string } = {}) {
    const where = this.buildExportFilter(filters);
    const students = await this.prisma.student.findMany({
      where,
      include: { class: true, major: true, batch: true, branch: true },
      take: 100,
      orderBy: { nis: 'asc' },
    });

    const total = await this.prisma.student.count({ where });

    return {
      total,
      preview_count: students.length,
      rows: students.map(s => ({
        nis: s.nis,
        full_name: s.full_name,
        branch: s.branch?.name || '-',
        class: s.class?.name || '-',
        major: s.major?.name || '-',
        batch: s.batch?.name || '-',
        status: s.status,
      })),
      filters,
    };
  }

  async exportToExcel(res: Response, filters: { branch_id?: string; major_id?: string; class_id?: string; batch_id?: string } = {}) {
    try {
      const where = this.buildExportFilter(filters);
      const students = await this.prisma.student.findMany({
        where,
        include: { class: true, major: true, batch: true, branch: true },
        orderBy: { nis: 'asc' },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Students');

      worksheet.columns = [
        { header: 'NIS', key: 'nis', width: 15 },
        { header: 'Nama Lengkap', key: 'full_name', width: 35 },
        { header: 'Cabang', key: 'branch', width: 20 },
        { header: 'Kelas', key: 'class', width: 15 },
        { header: 'Jurusan', key: 'major', width: 30 },
        { header: 'Angkatan', key: 'batch', width: 10 },
        { header: 'Status', key: 'status', width: 12 },
      ];

      students.forEach(s => {
        worksheet.addRow({
          nis: s.nis,
          full_name: s.full_name,
          branch: s.branch?.name || '-',
          class: s.class?.name || '-',
          major: s.major?.name || '-',
          batch: s.batch?.name || '-',
          status: s.status,
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ message: 'Gagal mengekspor data', error: error.message });
      }
    }
  }



  async bulkPromote(fromClassId: string, toClassId: string) {
    const [fromClass, toClass] = await Promise.all([
      this.prisma.class.findUnique({ where: { id: fromClassId }, include: { major: true } }),
      this.prisma.class.findUnique({ where: { id: toClassId }, include: { major: true } }),
    ]);
    if (!fromClass) throw new NotFoundException('Source class not found');
    if (!toClass) throw new NotFoundException('Target class not found');

    const students = await this.prisma.student.findMany({ where: { class_id: fromClassId } });
    if (students.length === 0) return { promoted: 0, message: 'No students in source class' };

    await this.prisma.student.updateMany({
      where: { class_id: fromClassId },
      data: {
        class_id: toClassId,
        major_id: toClass.major_id,
        batch_id: toClass.batch_id,
        branch_id: toClass.major.branch_id,
      },
    });

    return { promoted: students.length, from: fromClass.name, to: toClass.name };
  }
}
