import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('branches')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @Permissions('manage_users')
  create(@Body() data: { name: string }) {
    return this.branchesService.create(data);
  }

  @Get()
  @Public()
  findAll() {
    return this.branchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('manage_users')
  update(@Param('id') id: string, @Body() data: { name: string }) {
    return this.branchesService.update(id, data);
  }

  @Delete(':id')
  @Permissions('manage_users')
  remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }
}
