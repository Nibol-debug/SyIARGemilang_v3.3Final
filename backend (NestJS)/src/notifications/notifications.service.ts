import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  async broadcast(createNotificationDto: CreateNotificationDto) {
    // Create notification for all users
    const users = await this.prisma.user.findMany({
      select: { id: true },
    });

    const notifications = await Promise.all(
      users.map((user) =>
        this.prisma.notification.create({
          data: {
            ...createNotificationDto,
            user_id: user.id,
          },
        }),
      ),
    );

    return { success: true, count: notifications.length };
  }

  async findAll(user_id: string, pagination: PaginationDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { user_id },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.notification.count({ where: { user_id } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findUnreadCount(user_id: string) {
    const count = await this.prisma.notification.count({
      where: {
        user_id,
        is_read: false,
      },
    });

    return { count };
  }

  async findUnread(user_id: string, limit: number = 5) {
    return this.prisma.notification.findMany({
      where: {
        user_id,
        is_read: false,
      },
      take: limit,
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async markAsRead(id: string) {
    const notification = await this.findOne(id);
    return this.prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });
  }

  async markAllAsRead(user_id: string) {
    return this.prisma.notification.updateMany({
      where: {
        user_id,
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async removeAll(user_id: string) {
    return this.prisma.notification.deleteMany({
      where: { user_id },
    });
  }

  // Helper method to create notification for specific event
  async createForUser(user_id: string, title: string, message: string, type: string, link?: string) {
    return this.prisma.notification.create({
      data: {
        user_id,
        title,
        message,
        type,
        link,
      },
    });
  }
}
