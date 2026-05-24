import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('employee-attendance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeeAttendanceController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get('daily')
  @Permissions('view_hrm')
  getDailyAttendance(@Query('date') date: string) {
    return this.employeesService.getAttendanceByDate(date || new Date().toISOString());
  }

  @Get('monthly')
  @Permissions('view_hrm')
  getMonthlyAttendance(@Query('month') month: string) {
    return this.employeesService.getMonthlyAttendance(month || new Date().toISOString().slice(0, 7));
  }

  @Post('self')
  @Permissions('manage_hrm')
  recordSelfAttendance(@Req() req: any) {
    const employeeId = req.user.employeeId;
    if (!employeeId) {
      throw new Error('Akun Anda tidak terhubung dengan data pegawai.');
    }
    return this.employeesService.recordSelfAttendance(employeeId);
  }

  @Post('bulk')
  @Permissions('manage_hrm')
  recordBulkAttendance(@Body() body: { date: string, attendances: any[] }) {
    return this.employeesService.recordBulkAttendance(body.date, body.attendances);
  }
}
