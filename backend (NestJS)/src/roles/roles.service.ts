import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string }) {
    return this.prisma.role.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, data: { name?: string; permissionIds?: string[] }) {
    const { permissionIds, ...roleData } = data;

    if (permissionIds) {
      // Sync permissions
      await this.prisma.rolePermission.deleteMany({
        where: { role_id: id },
      });

      if (permissionIds.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: permissionIds.map((pId) => ({
            role_id: id,
            permission_id: pId,
          })),
        });
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: roleData,
    });
  }
}
