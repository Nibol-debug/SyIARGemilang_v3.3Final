import { Controller, Get, Param, Query, UseGuards, StreamableFile } from '@nestjs/common';
import { ReportCardsService } from './report-cards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('report-cards')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportCardsController {
  constructor(private readonly reportCardsService: ReportCardsService) {}

  /**
   * GET /report-cards/student/:studentId/semester/:semester
   * Get data rapor (JSON format)
   */
  @Get('student/:studentId/semester/:semester')
  @Permissions('view_grades')
  getReportCardData(
    @Param('studentId') studentId: string,
    @Param('semester') semester: number
  ) {
    return this.reportCardsService.getReportCardData(studentId, parseInt(semester.toString()));
  }

  /**
   * GET /report-cards/student/:studentId/semester/:semester/pdf
   * Download rapor (PDF format)
   */
  @Get('student/:studentId/semester/:semester/pdf')
  @Permissions('view_grades')
  async downloadReportCard(
    @Param('studentId') studentId: string,
    @Param('semester') semester: number
  ): Promise<StreamableFile> {
    return this.reportCardsService.generateReportCard(studentId, parseInt(semester.toString()));
  }

  /**
   * GET /report-cards/class/:classId/semester/:semester
   * Get semua rapor untuk satu kelas
   */
  @Get('class/:classId/semester/:semester')
  @Permissions('view_grades')
  async getClassReportCards(
    @Param('classId') classId: string,
    @Param('semester') semester: number
  ) {
    return this.reportCardsService.getClassReportCards(classId, parseInt(semester.toString()));
  }
}
