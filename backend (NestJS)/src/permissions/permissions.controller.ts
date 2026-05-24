import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Permissions('manage_users')
  create(@Body() data: { name: string }) {
    return this.permissionsService.create(data);
  }

  @Get()
  @Permissions('manage_users')
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @Permissions('manage_users')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Delete(':id')
  @Permissions('manage_users')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
