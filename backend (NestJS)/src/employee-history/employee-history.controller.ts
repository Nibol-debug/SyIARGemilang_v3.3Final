import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { EmployeeHistoryService } from './employee-history.service';
import { CreateEmployeeHistoryDto } from './dto/create-employee-history.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('employee-history')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeeHistoryController {
  constructor(private readonly employeeHistoryService: EmployeeHistoryService) {}

  @Post()
  @Permissions('manage_hrm')
  create(@Body() createEmployeeHistoryDto: CreateEmployeeHistoryDto) {
    return this.employeeHistoryService.create(createEmployeeHistoryDto);
  }

  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('employee_id') employee_id?: string,
    @Query('type') type?: string,
  ) {
    return this.employeeHistoryService.findAll(pagination, { employee_id, type });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeHistoryService.findOne(id);
  }

  @Patch(':id')
  @Permissions('manage_hrm')
  update(@Param('id') id: string, @Body() updateEmployeeHistoryDto: any) {
    return this.employeeHistoryService.update(id, updateEmployeeHistoryDto);
  }

  @Delete(':id')
  @Permissions('manage_hrm')
  remove(@Param('id') id: string) {
    return this.employeeHistoryService.remove(id);
  }
}
