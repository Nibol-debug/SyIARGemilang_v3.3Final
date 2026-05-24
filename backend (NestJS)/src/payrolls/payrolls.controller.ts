import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { PayrollsService } from './payrolls.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('payrolls')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PayrollsController {
  constructor(private readonly payrollsService: PayrollsService) {}

  @Post()
  @Permissions('manage_hrm')
  create(@Body() createPayrollDto: CreatePayrollDto) {
    return this.payrollsService.create(createPayrollDto);
  }

  @Post('generate')
  @Permissions('manage_hrm')
  generate(
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.payrollsService.generatePayroll(
      parseInt(month),
      parseInt(year),
    );
  }

  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('employee_id') employee_id?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.payrollsService.findAll(pagination, {
      employee_id,
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollsService.findOne(id);
  }

  @Patch(':id/pay')
  @Permissions('manage_hrm')
  markAsPaid(@Param('id') id: string) {
    return this.payrollsService.markAsPaid(id);
  }

  @Patch(':id')
  @Permissions('manage_hrm')
  update(@Param('id') id: string, @Body() updatePayrollDto: any) {
    return this.payrollsService.update(id, updatePayrollDto);
  }

  @Delete(':id')
  @Permissions('manage_hrm')
  remove(@Param('id') id: string) {
    return this.payrollsService.remove(id);
  }
}
