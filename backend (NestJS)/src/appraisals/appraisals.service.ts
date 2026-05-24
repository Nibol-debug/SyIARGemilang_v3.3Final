import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppraisalDto } from './dto/create-appraisal.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class AppraisalsService {
  constructor(private prisma: PrismaService) {}

  async create(createAppraisalDto: CreateAppraisalDto) {
    if (!createAppraisalDto.evaluator_id) {
      throw new Error('evaluator_id wajib diisi');
    }

    return this.prisma.employeeAppraisal.create({
      data: {
        employee_id: createAppraisalDto.employee_id,
        evaluator_id: createAppraisalDto.evaluator_id,
        period: createAppraisalDto.period,
        discipline_score: createAppraisalDto.discipline_score,
        pedagogic_score: createAppraisalDto.pedagogic_score,
        professional_score: createAppraisalDto.professional_score,
        notes: createAppraisalDto.notes || null,
      },
      include: {
        employee: true,
        evaluator: true,
      },
    });
  }

  async findAll(pagination: PaginationDto, filters: { employee_id?: string; evaluator_id?: string; period?: string }) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.employee_id) where.employee_id = filters.employee_id;
    if (filters.evaluator_id) where.evaluator_id = filters.evaluator_id;
    if (filters.period) where.period = filters.period;

    const [data, total] = await Promise.all([
      this.prisma.employeeAppraisal.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: true,
          evaluator: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.employeeAppraisal.count({ where }),
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
    const appraisal = await this.prisma.employeeAppraisal.findUnique({
      where: { id },
      include: {
        employee: true,
        evaluator: true,
      },
    });
    if (!appraisal) throw new NotFoundException(`Appraisal with ID ${id} not found`);
    return appraisal;
  }

  async update(id: string, updateAppraisalDto: any) {
    const appraisal = await this.prisma.employeeAppraisal.findUnique({ where: { id } });
    if (!appraisal) throw new NotFoundException(`Appraisal with ID ${id} not found`);

    return this.prisma.employeeAppraisal.update({
      where: { id },
      data: updateAppraisalDto,
      include: {
        employee: true,
        evaluator: true,
      },
    });
  }

  async remove(id: string) {
    const appraisal = await this.prisma.employeeAppraisal.findUnique({ where: { id } });
    if (!appraisal) throw new NotFoundException(`Appraisal with ID ${id} not found`);

    return this.prisma.employeeAppraisal.delete({ where: { id } });
  }

  async calculateDisciplineScore(employeeId: string, period: string) {
    const year = parseInt(period.split('-')[0]);
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 0, 23, 59, 59, 999);

    const totalAttendance = await this.prisma.employeeAttendance.count({
      where: {
        employee_id: employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (totalAttendance === 0) return 0;

    const presentCount = await this.prisma.employeeAttendance.count({
      where: {
        employee_id: employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: 'Hadir',
      },
    });

    return Math.round((presentCount / totalAttendance) * 100 * 100) / 100;
  }
}
