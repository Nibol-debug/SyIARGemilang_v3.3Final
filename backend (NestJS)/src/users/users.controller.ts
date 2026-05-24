import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  Req,
  BadRequestException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(AuditInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Req() req: any) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Patch('me')
  async updateProfile(@Req() req: any, @Body() data: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.sub, data);
  }

  @Post('me/change-password')
  async changePassword(@Req() req: any, @Body() body: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.sub, body.currentPassword, body.newPassword);
  }

  @Get('me/devices')
  getMyDevices(@Req() req: any) {
    return this.usersService.getDevices(req.user.sub);
  }

  @Delete('me/devices/:deviceId')
  removeMyDevice(@Req() req: any, @Param('deviceId') deviceId: string) {
    return this.usersService.toggleDeviceStatus(req.user.sub, deviceId, false);
  }

  @Get()
  @Permissions('view_users')
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('roleId') roleId?: string,
  ) {
    return this.usersService.findAll({ page, limit, search, roleId });
  }

  @Get(':id')
  @Permissions('view_users')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Permissions('manage_users')
  create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  @Patch(':id')
  @Permissions('manage_users')
  update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  @Permissions('manage_users')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get(':id/devices')
  @Permissions('view_users')
  getDevices(@Param('id') id: string) {
    return this.usersService.getDevices(id);
  }

  @Patch(':id/devices/:deviceId')
  @Permissions('manage_users')
  toggleDevice(
    @Param('id') id: string,
    @Param('deviceId') deviceId: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.usersService.toggleDeviceStatus(id, deviceId, isActive);
  }
}
