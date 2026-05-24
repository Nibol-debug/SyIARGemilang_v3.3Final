import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions('manage_users')
  create(@Body() data: { name: string }) {
    return this.rolesService.create(data);
  }

  @Get()
  @Permissions('manage_users')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions('manage_users')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('manage_users')
  update(@Param('id') id: string, @Body() data: { name?: string; permissionIds?: string[] }) {
    return this.rolesService.update(id, data);
  }
}
