import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async create(createClassDto: CreateClassDto) {
    return this.prisma.class.create({
      data: createClassDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.class.findMany({
        skip,
        take: limit,
        include: {
          major: { include: { branch: true } },
          batch: true,
          homeroom_teacher: true,
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.class.count(),
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
    const classData = await this.prisma.class.findUnique({
      where: { id },
      include: {
        major: true,
        batch: true,
        homeroom_teacher: true,
      },
    });
    if (!classData) throw new NotFoundException(`Class with ID ${id} not found`);
    return classData;
  }

  async findStudents(id: string) {
    await this.findOne(id);
    return this.prisma.student.findMany({
      where: { class_id: id, status: 'active' },
      orderBy: { full_name: 'asc' },
      select: {
        id: true,
        nis: true,
        full_name: true,
        gender: true,
        profile_picture: true,
      },
    });
  }

  async update(id: string, updateClassDto: UpdateClassDto) {
    await this.findOne(id);
    return this.prisma.class.update({
      where: { id },
      data: updateClassDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.class.delete({
      where: { id },
    });
  }
}
