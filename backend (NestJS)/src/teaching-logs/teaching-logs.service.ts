import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeachingLogDto } from './dto/create-teaching-log.dto';
import { UpdateTeachingLogDto } from './dto/update-teaching-log.dto';

@Injectable()
export class TeachingLogsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTeachingLogDto) {
    return this.prisma.teachingLog.create({
      data,
      include: { teacher: true, class: true, subject: true },
    });
  }

  async findAll(filters: { teacher_id?: string; class_id?: string }) {
    return this.prisma.teachingLog.findMany({
      where: filters,
      include: {
        teacher: true,
        class: true,
        subject: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const log = await this.prisma.teachingLog.findUnique({
      where: { id },
      include: { teacher: true, class: true, subject: true },
    });
    if (!log) throw new NotFoundException('Teaching log not found');
    return log;
  }

  async update(id: string, data: UpdateTeachingLogDto) {
    await this.findOne(id);
    return this.prisma.teachingLog.update({
      where: { id },
      data,
      include: { teacher: true, class: true, subject: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.teachingLog.delete({ where: { id } });
  }
}
