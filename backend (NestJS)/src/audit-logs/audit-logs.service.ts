import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    module?: string;
    action?: string;
    user?: any;
  }) {
    const { page = 1, limit = 10, module, action, user } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (module) where.module = module;
    if (action) where.action = action;

    if (user && user.role !== 'Administrator Utama' && user.role !== 'Kepala Diklat') {
      where.user_id = user.userId;
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { username: true }
          }
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
