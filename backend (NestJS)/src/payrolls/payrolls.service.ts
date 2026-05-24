import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PayrollsService {
  constructor(private prisma: PrismaService) {}

  async create(createPayrollDto: CreatePayrollDto) {
    return this.prisma.payroll.create({
      data: createPayrollDto,
      include: {
        employee: true,
      },
    });
  }

  async findAll(pagination: PaginationDto, filters: { employee_id?: string; month?: number; year?: number }) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.employee_id) where.employee_id = filters.employee_id;
    if (filters.month) where.month = filters.month;
    if (filters.year) where.year = filters.year;

    const [data, total] = await Promise.all([
      this.prisma.payroll.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: {
            include: {
              salary_config: true,
            },
          },
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      this.prisma.payroll.count({ where }),
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
    const payroll = await this.prisma.payroll.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            salary_config: true,
            user: { select: { id: true, username: true } },
          },
        },
      },
    });
    if (!payroll) throw new NotFoundException(`Payroll with ID ${id} not found`);
    return payroll;
  }

  async generatePayroll(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const employees = await this.prisma.employee.findMany({
      where: { status: 'active' },
      include: { salary_config: true },
    });

    const results: any[] = [];

    for (const emp of employees) {
      const existing = await this.prisma.payroll.findUnique({
        where: {
          employee_id_month_year: {
            employee_id: emp.id,
            month,
            year,
          },
        },
      });

      if (existing) continue;

      const absences = await this.prisma.employeeAttendance.count({
        where: {
          employee_id: emp.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
          status: 'Alpa',
        },
      });

      const cfg = emp.salary_config;
      const basicSalary = cfg?.basic_salary?.toNumber() || 3000000;
      const tunjMasakerja = cfg?.tunj_masakerja?.toNumber() || 0;
      const tunjJabatan = cfg?.tunj_jabatan?.toNumber() || 0;
      const tunjFungsional = cfg?.tunj_fungsional?.toNumber() || 0;
      const tunjKeluarga = cfg?.tunj_keluarga?.toNumber() || 0;
      const tunjBeras = cfg?.tunj_beras?.toNumber() || 0;
      const tunjTransport = cfg?.tunj_transport?.toNumber() || 0;
      const tunjLainnya = cfg?.tunj_lainnya?.toNumber() || 0;
      const potAlpha = cfg?.pot_alpha?.toNumber() || 50000;

      const totalAllowances = tunjMasakerja + tunjJabatan + tunjFungsional + tunjKeluarga + tunjBeras + tunjTransport + tunjLainnya;
      const deductions = absences * potAlpha;
      const netSalary = basicSalary + totalAllowances - deductions;

      const payroll = await this.prisma.payroll.create({
        data: {
          employee_id: emp.id,
          month,
          year,
          basic_salary: basicSalary,
          allowances: totalAllowances,
          deductions,
          net_salary: netSalary,
          status: 'pending',
        },
        include: {
          employee: true,
        },
      });

      results.push({
        ...payroll,
        salary_breakdown: {
          basic_salary: basicSalary,
          tunj_masakerja: tunjMasakerja,
          tunj_jabatan: tunjJabatan,
          tunj_fungsional: tunjFungsional,
          tunj_keluarga: tunjKeluarga,
          tunj_beras: tunjBeras,
          tunj_transport: tunjTransport,
          tunj_lainnya: tunjLainnya,
          total_allowances: totalAllowances,
          absences,
          pot_alpha: potAlpha,
          deductions,
          net_salary: netSalary,
        },
      });
    }

    return results;
  }

  async markAsPaid(id: string) {
    const payroll = await this.prisma.payroll.findUnique({ where: { id } });
    if (!payroll) throw new NotFoundException(`Payroll with ID ${id} not found`);

    return this.prisma.payroll.update({
      where: { id },
      data: {
        status: 'paid',
        payment_date: new Date(),
      },
      include: {
        employee: true,
      },
    });
  }

  async update(id: string, updatePayrollDto: any) {
    const payroll = await this.prisma.payroll.findUnique({ where: { id } });
    if (!payroll) throw new NotFoundException(`Payroll with ID ${id} not found`);

    return this.prisma.payroll.update({
      where: { id },
      data: updatePayrollDto,
      include: {
        employee: true,
      },
    });
  }

  async remove(id: string) {
    const payroll = await this.prisma.payroll.findUnique({ where: { id } });
    if (!payroll) throw new NotFoundException(`Payroll with ID ${id} not found`);

    return this.prisma.payroll.delete({ where: { id } });
  }
}
