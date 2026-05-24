import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateSalaryConfigDto } from './dto/update-salary-config.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    return this.prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: createEmployeeDto,
      });

      // Auto-create user account for employee
      try {
        // Determine role based on position
        let roleName = 'Instruktur';
        const posLower = createEmployeeDto.position?.toLowerCase() || '';
        if (posLower.includes('bendahara') || posLower.includes('tu')) {
          roleName = 'Bendahara';
        } else if (posLower.includes('sarpras') || posLower.includes('inventaris')) {
          roleName = 'Staf Sarpras';
        } else if (posLower.includes('kepala')) {
          roleName = 'Kepala Diklat';
        } else if (posLower.includes('wali')) {
          roleName = 'Wali Kelas';
        }

        const role = await tx.role.findUnique({ where: { name: roleName } });
        if (role) {
          // Generate username from name: lowercase, no spaces, + random suffix
          const baseName = createEmployeeDto.full_name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 15);
          const suffix = Math.floor(10 + Math.random() * 90);
          const username = `${baseName}${suffix}`;

          const hashedPassword = await bcrypt.hash('rgi123', 10);
          await tx.user.create({
            data: {
              username,
              password_hash: hashedPassword,
              role_id: role.id,
              employee_id: employee.id,
            },
          });
        }
      } catch (err) {
        console.error('Auto-create user for employee failed:', err);
      }

      return employee;
    });
  }

  async findAll(pagination: PaginationDto, filters: { major_id?: string; search?: string }) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { ...filters };
    if (filters.search) {
      where.full_name = { contains: filters.search };
      delete where.search;
    }

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        include: {
          major: true,
        },
      }),
      this.prisma.employee.count({ where }),
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
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        major: true,
        documents: true,
        attendance: true,
        salary_config: true,
      },
    });
    if (!employee) throw new NotFoundException(`Employee with ID ${id} not found`);
    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    return this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.user.deleteMany({ where: { employee_id: id } });
        await tx.employeeDocument.deleteMany({ where: { employee_id: id } });
        await tx.employeeAttendance.deleteMany({ where: { employee_id: id } });
        await tx.class.updateMany({
          where: { homeroom_teacher_id: id },
          data: { homeroom_teacher_id: null },
        });
        await tx.schedule.deleteMany({ where: { teacher_id: id } });
        await tx.teachingLog.deleteMany({ where: { teacher_id: id } });
        await tx.assetLoan.deleteMany({ where: { employee_id: id } });
        await tx.studentBehaviorAssessment.deleteMany({ where: { assessor_id: id } });
        return tx.employee.delete({ where: { id } });
      });
    } catch (err: any) {
      if (err?.code === 'P2003' || err?.message?.includes('foreign key')) {
        throw new ConflictException(
          'Tidak dapat menghapus pegawai karena masih memiliki data terkait di modul lain. Hapus terlebih dahulu data Penilaian Sikap, Peminjaman Aset, atau data lain yang merujuk pegawai ini.'
        );
      }
      throw err;
    }
  }

  async getSalaryConfig(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    let config = await this.prisma.salaryConfig.findUnique({
      where: { employee_id: employeeId },
    });

    if (!config) {
      config = await this.prisma.salaryConfig.create({
        data: { employee_id: employeeId },
      });
    }

    return config;
  }

  async updateSalaryConfig(employeeId: string, dto: UpdateSalaryConfigDto) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    return this.prisma.salaryConfig.upsert({
      where: { employee_id: employeeId },
      update: dto,
      create: { employee_id: employeeId, ...dto },
    });
  }

  async addDocument(employeeId: string, fileUrl: string, type: string) {
    return this.prisma.employeeDocument.create({
      data: {
        employee_id: employeeId,
        file_url: fileUrl,
        type: type,
      },
    });
  }

  async getAttendanceByDate(dateStr: string) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const employees = await this.prisma.employee.findMany({
      include: {
        attendance: {
          where: {
            date: {
              gte: date,
              lt: nextDay,
            },
          },
        },
        major: true,
      },
      orderBy: { full_name: 'asc' },
    });

    return employees.map(emp => ({
      id: emp.id,
      full_name: emp.full_name,
      position: emp.position,
      major: emp.major?.code || 'STAF',
      status: emp.attendance[0]?.status || '', // Get status for that specific day if exists
    }));
  }

  async recordBulkAttendance(dateStr: string, records: { employee_id: string; status: string }[]) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    // Filter out records without status
    const validRecords = records.filter(r => r.status);

    return this.prisma.$transaction(async (tx) => {
      // 1. Delete existing records for these employees on this date
      await tx.employeeAttendance.deleteMany({
        where: {
          date: {
            gte: date,
            lt: nextDay,
          },
          employee_id: {
            in: validRecords.map(r => r.employee_id)
          }
        }
      });

      // 2. Create new records
      if (validRecords.length > 0) {
        await tx.employeeAttendance.createMany({
          data: validRecords.map(r => ({
            employee_id: r.employee_id,
            status: r.status,
            date: date,
          }))
        });
      }
      
      return { count: validRecords.length };
    });
  }

  async recordSelfAttendance(employeeId: string) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const existing = await this.prisma.employeeAttendance.findFirst({
      where: {
        employee_id: employeeId,
        date: {
          gte: date,
          lt: nextDay,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Anda sudah melakukan presensi hari ini.');
    }

    return this.prisma.employeeAttendance.create({
      data: {
        employee_id: employeeId,
        status: 'Hadir',
        date: date,
      },
    });
  }

  async getMonthlyAttendance(monthStr: string) {
    // monthStr format: YYYY-MM
    const [year, month] = monthStr.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const attendances = await this.prisma.employeeAttendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const employees = await this.prisma.employee.findMany({
      include: { major: true }
    });

    return employees.map(emp => {
      const empAtt = attendances.filter(a => a.employee_id === emp.id);
      return {
        id: emp.id,
        full_name: emp.full_name,
        position: emp.position,
        major: emp.major?.code || 'STAF',
        hadir: empAtt.filter(a => a.status === 'Hadir').length,
        izin: empAtt.filter(a => a.status === 'Izin' || a.status === 'Sakit').length,
        alpa: empAtt.filter(a => a.status === 'Alpa').length,
        total_days: empAtt.length,
      };
    });
  }
}
