import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  private async checkClash(data: { teacher_id?: string; class_id?: string; day?: string; start_time?: string; end_time?: string }, excludeId?: string) {
    if (!data.teacher_id || !data.class_id || !data.day || !data.start_time || !data.end_time) return;

    const whereTeacher: any = {
      teacher_id: data.teacher_id,
      day: data.day,
      OR: [
        { start_time: { lte: data.start_time }, end_time: { gt: data.start_time } },
        { start_time: { lt: data.end_time }, end_time: { gte: data.end_time } },
      ],
    };
    if (excludeId) whereTeacher.id = { not: excludeId };

    const teacherClash = await this.prisma.schedule.findFirst({ where: whereTeacher });
    if (teacherClash) {
      throw new BadRequestException('Teacher already has a schedule at this time');
    }

    const whereClass: any = {
      class_id: data.class_id,
      day: data.day,
      OR: [
        { start_time: { lte: data.start_time }, end_time: { gt: data.start_time } },
        { start_time: { lt: data.end_time }, end_time: { gte: data.end_time } },
      ],
    };
    if (excludeId) whereClass.id = { not: excludeId };

    const classClash = await this.prisma.schedule.findFirst({ where: whereClass });
    if (classClash) {
      throw new BadRequestException('Class already has a schedule at this time');
    }
  }

  async create(data: CreateScheduleDto) {
    await this.checkClash(data);
    return this.prisma.schedule.create({
      data,
      include: { class: true, subject: true, teacher: true },
    });
  }

  async findAll(filters: { class_id?: string; teacher_id?: string; day?: string }) {
    return this.prisma.schedule.findMany({
      where: filters,
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
      orderBy: [
        { day: 'asc' },
        { start_time: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: { class: true, subject: true, teacher: true },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  async update(id: string, data: UpdateScheduleDto) {
    await this.findOne(id);
    await this.checkClash(data as any, id);
    return this.prisma.schedule.update({
      where: { id },
      data,
      include: { class: true, subject: true, teacher: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.schedule.delete({ where: { id } });
  }
}
