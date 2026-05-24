import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeHistoryDto } from './dto/create-employee-history.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class EmployeeHistoryService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeHistoryDto: CreateEmployeeHistoryDto) {
    const date = new Date(createEmployeeHistoryDto.date);
    date.setHours(0, 0, 0, 0);

    return this.prisma.employeeHistory.create({
      data: {
        employee_id: createEmployeeHistoryDto.employee_id,
        type: createEmployeeHistoryDto.type,
        description: createEmployeeHistoryDto.description,
        date: date,
      },
      include: {
        employee: true,
      },
    });
  }

  async findAll(pagination: PaginationDto, filters: { employee_id?: string; type?: string }) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.employee_id) where.employee_id = filters.employee_id;
    if (filters.type) where.type = filters.type;

    const [data, total] = await Promise.all([
      this.prisma.employeeHistory.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: true,
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.employeeHistory.count({ where }),
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
    const history = await this.prisma.employeeHistory.findUnique({
      where: { id },
      include: {
        employee: true,
      },
    });
    if (!history) throw new NotFoundException(`Employee history with ID ${id} not found`);
    return history;
  }

  async update(id: string, updateEmployeeHistoryDto: any) {
    const history = await this.prisma.employeeHistory.findUnique({ where: { id } });
    if (!history) throw new NotFoundException(`Employee history with ID ${id} not found`);

    return this.prisma.employeeHistory.update({
      where: { id },
      data: updateEmployeeHistoryDto,
      include: {
        employee: true,
      },
    });
  }

  async remove(id: string) {
    const history = await this.prisma.employeeHistory.findUnique({ where: { id } });
    if (!history) throw new NotFoundException(`Employee history with ID ${id} not found`);

    return this.prisma.employeeHistory.delete({ where: { id } });
  }
}
