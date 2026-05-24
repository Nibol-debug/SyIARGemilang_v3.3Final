import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  getDashboardStats(@Request() req: any) {
    const { role, employeeId, studentId } = req.user;

    if (role === 'Administrator Utama' || role === 'Kepala Diklat' || role === 'Bendahara') {
      return this.statsService.getDashboardStats();
    }

    if (role === 'Instruktur' || role === 'Wali Kelas') {
      return this.statsService.getGuruDashboardStats(employeeId);
    }

    if (role === 'Siswa' || role === 'Orang Tua') {
      return this.statsService.getStudentDashboardStats(studentId);
    }

    return this.statsService.getDashboardStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('students')
  getStudentStats() {
    return this.statsService.getStudentStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('employees')
  getEmployeeStats() {
    return this.statsService.getEmployeeStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('grading')
  getGradingStats() {
    return this.statsService.getGradingStats();
  }
}
