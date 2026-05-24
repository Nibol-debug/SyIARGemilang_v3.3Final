import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { AcademicCalendarService } from './academic-calendar.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('academic-calendar')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AcademicCalendarController {
  constructor(private readonly academicCalendarService: AcademicCalendarService) {}

  @Post()
  @Permissions('manage_academic')
  create(@Body() createCalendarDto: CreateCalendarDto) {
    return this.academicCalendarService.create(createCalendarDto);
  }

  @Get()
  findAll() {
    return this.academicCalendarService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.academicCalendarService.findOne(id);
  }

  @Patch(':id')
  @Permissions('manage_academic')
  update(@Param('id') id: string, @Body() updateCalendarDto: UpdateCalendarDto) {
    return this.academicCalendarService.update(id, updateCalendarDto);
  }

  @Delete(':id')
  @Permissions('manage_academic')
  remove(@Param('id') id: string) {
    return this.academicCalendarService.remove(id);
  }
}
