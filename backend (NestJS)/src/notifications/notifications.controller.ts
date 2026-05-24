import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Permissions('view_notifications')
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Post('broadcast')
  @Permissions('view_notifications')
  broadcast(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.broadcast(createNotificationDto);
  }

  @Get()
  findAll(@Req() req: any, @Query() pagination: PaginationDto) {
    const user_id = req.user.sub;
    return this.notificationsService.findAll(user_id, pagination);
  }

  @Get('unread')
  findUnread(@Req() req: any, @Query('limit') limit?: string) {
    const user_id = req.user.sub;
    return this.notificationsService.findUnread(user_id, limit ? parseInt(limit, 10) : 5);
  }

  @Get('unread-count')
  async findUnreadCount(@Req() req: any) {
    const user_id = req.user.sub;
    if (!user_id) {
      return { count: 0 };
    }
    try {
      return await this.notificationsService.findUnreadCount(user_id);
    } catch (err: any) {
      console.error(`[NOTIFICATION_ERROR] user_id=${user_id} error=${err?.message || err}`);
      throw err;
    }
  }

  @Post('mark-all-as-read')
  markAllAsRead(@Req() req: any) {
    const user_id = req.user.sub;
    return this.notificationsService.markAllAsRead(user_id);
  }

  @Delete()
  removeAll(@Req() req: any) {
    const user_id = req.user.sub;
    return this.notificationsService.removeAll(user_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/mark-as-read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
