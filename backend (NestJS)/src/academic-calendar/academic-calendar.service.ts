import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';

@Injectable()
export class AcademicCalendarService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCalendarDto) {
    return this.prisma.academicCalendar.create({ data });
  }

  async findAll() {
    return this.prisma.academicCalendar.findMany({
      orderBy: { date: 'asc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.academicCalendar.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Calendar event not found');
    return event;
  }

  async update(id: string, data: UpdateCalendarDto) {
    await this.findOne(id);
    return this.prisma.academicCalendar.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.academicCalendar.delete({ where: { id } });
  }
}
