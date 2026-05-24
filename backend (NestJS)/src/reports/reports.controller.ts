import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  @Permissions('view_reports')
  getSummary() {
    return this.reportsService.getSummary();
  }

  @Get('attendance')
  @Permissions('view_reports')
  getAttendanceReport(@Query('month') month?: string) {
    return this.reportsService.getAttendanceReport(month);
  }

  @Get('finance')
  @Permissions('view_reports')
  getFinanceReport(@Query('month') month?: string) {
    return this.reportsService.getFinanceReport(month);
  }

  @Get('academic')
  @Permissions('view_reports')
  getAcademicReport() {
    return this.reportsService.getAcademicReport();
  }
}
