import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class BatchesService {
  constructor(private prisma: PrismaService) {}

  async create(createBatchDto: CreateBatchDto) {
    return this.prisma.batch.create({
      data: createBatchDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.batch.findMany({
        skip,
        take: limit,
        orderBy: { start_date: 'desc' },
      }),
      this.prisma.batch.count(),
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
    const batch = await this.prisma.batch.findUnique({
      where: { id },
    });
    if (!batch) throw new NotFoundException(`Batch with ID ${id} not found`);
    return batch;
  }

  async update(id: string, updateBatchDto: UpdateBatchDto) {
    const batch = await this.findOne(id);
    
    // If transitioning from active to inactive
    if (batch.is_active === true && updateBatchDto.is_active === false) {
      await this.prisma.student.updateMany({
        where: { batch_id: id, status: 'active' },
        data: { status: 'alumni' },
      });
    }

    return this.prisma.batch.update({
      where: { id },
      data: updateBatchDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.batch.delete({
      where: { id },
    });
  }
}
