import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSubjectDto) {
    return this.prisma.subject.create({ data });
  }

  async findAll(pagination: PaginationDto, major_id?: string) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const where = major_id
      ? { OR: [{ major_id }, { major_id: null }] }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        skip,
        take: limit,
        include: { major: true },
      }),
      this.prisma.subject.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, last_page: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: { major: true },
    });
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async update(id: string, data: UpdateSubjectDto) {
    await this.findOne(id);
    return this.prisma.subject.update({
      where: { id },
      data,
      include: { major: true },
    });
  }

  async remove(id: string) {
    return this.prisma.subject.delete({ where: { id } });
  }
}
