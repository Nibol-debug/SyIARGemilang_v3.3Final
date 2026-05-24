import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UseGuards } from '@nestjs/common';
import { TeachingLogsService } from './teaching-logs.service';
import { CreateTeachingLogDto } from './dto/create-teaching-log.dto';
import { UpdateTeachingLogDto } from './dto/update-teaching-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('teaching-log')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TeachingLogsController {
  constructor(private readonly teachingLogsService: TeachingLogsService) {}

  @Post()
  @Permissions('manage_academic')
  create(@Body() createTeachingLogDto: CreateTeachingLogDto) {
    return this.teachingLogsService.create(createTeachingLogDto);
  }

  @Get()
  @Permissions('view_academic')
  findAll(@Query('teacher_id') teacher_id?: string, @Query('class_id') class_id?: string) {
    return this.teachingLogsService.findAll({ teacher_id, class_id });
  }

  @Get(':id')
  @Permissions('view_academic')
  findOne(@Param('id') id: string) {
    return this.teachingLogsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('manage_academic')
  update(@Param('id') id: string, @Body() updateTeachingLogDto: UpdateTeachingLogDto) {
    return this.teachingLogsService.update(id, updateTeachingLogDto);
  }

  @Delete(':id')
  @Permissions('manage_academic')
  remove(@Param('id') id: string) {
    return this.teachingLogsService.remove(id);
  }
}
