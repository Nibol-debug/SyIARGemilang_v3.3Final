import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string }) {
    return this.prisma.branch.create({ data });
  }

  async findAll() {
    return this.prisma.branch.findMany({
      include: { _count: { select: { students: true, majors: true } } },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: { majors: true },
    });
    if (!branch) throw new NotFoundException(`Branch with ID ${id} not found`);
    return branch;
  }

  async update(id: string, data: { name: string }) {
    return this.prisma.branch.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.branch.delete({ where: { id } });
  }
}
