import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class LeavesService {
  constructor(private prisma: PrismaService) {}

  async create(createLeaveRequestDto: CreateLeaveRequestDto) {
    const startDate = new Date(createLeaveRequestDto.start_date);
    const endDate = new Date(createLeaveRequestDto.end_date);

    if (endDate < startDate) {
      throw new BadRequestException('Tanggal akhir tidak boleh lebih kecil dari tanggal mulai');
    }

    if (!createLeaveRequestDto.employee_id) {
      throw new BadRequestException('employee_id wajib diisi');
    }

    return this.prisma.leaveRequest.create({
      data: {
        employee_id: createLeaveRequestDto.employee_id,
        type: createLeaveRequestDto.type,
        start_date: startDate,
        end_date: endDate,
        reason: createLeaveRequestDto.reason,
        proof_url: createLeaveRequestDto.proof_url || null,
      },
      include: {
        employee: true,
      },
    });
  }

  async findAll(pagination: PaginationDto, filters: { status?: string; employee_id?: string }) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.employee_id) where.employee_id = filters.employee_id;

    const [data, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: true,
          approver: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.leaveRequest.count({ where }),
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
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: true,
        approver: true,
      },
    });
    if (!leave) throw new NotFoundException(`Leave request with ID ${id} not found`);
    return leave;
  }

  async approve(id: string, approverId: string) {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException(`Leave request with ID ${id} not found`);
    if (leave.status !== 'pending') {
      throw new BadRequestException('Leave request already processed');
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'approved',
        approver_id: approverId,
      },
      include: {
        employee: true,
        approver: true,
      },
    });
  }

  async reject(id: string, approverId: string) {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException(`Leave request with ID ${id} not found`);
    if (leave.status !== 'pending') {
      throw new BadRequestException('Leave request already processed');
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        approver_id: approverId,
      },
      include: {
        employee: true,
        approver: true,
      },
    });
  }

  async updateProof(id: string, proofUrl: string) {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException(`Leave request with ID ${id} not found`);

    return this.prisma.leaveRequest.update({
      where: { id },
      data: { proof_url: proofUrl },
      include: {
        employee: true,
      },
    });
  }
}
