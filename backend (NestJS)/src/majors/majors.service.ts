import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class MajorsService {
  constructor(private prisma: PrismaService) {}

  async create(createMajorDto: CreateMajorDto) {
    return this.prisma.major.create({
      data: createMajorDto,
    });
  }

  async findAll(paginationDto: PaginationDto, branchId?: string) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (branchId) {
      where.branch_id = branchId;
    }

    const [data, total] = await Promise.all([
      this.prisma.major.findMany({
        where,
        skip,
        take: limit,
        include: { branch: true },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.major.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const major = await this.prisma.major.findUnique({
      where: { id },
    });
    if (!major) throw new NotFoundException(`Major with ID ${id} not found`);
    return major;
  }

  async update(id: string, updateMajorDto: UpdateMajorDto) {
    await this.findOne(id);
    return this.prisma.major.update({
      where: { id },
      data: updateMajorDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.major.delete({
      where: { id },
    });
  }
}
