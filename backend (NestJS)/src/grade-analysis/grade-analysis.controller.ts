import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { GradeAnalysisService } from './grade-analysis.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('grade-analysis')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GradeAnalysisController {
  constructor(private readonly gradeAnalysisService: GradeAnalysisService) {}

  /**
   * GET /grade-analysis/exam/:examId/statistics
   * Statistik lengkap untuk sebuah ujian
   */
  @Get('exam/:examId/statistics')
  @Permissions('view_grades')
  getExamStatistics(@Param('examId') examId: string) {
    return this.gradeAnalysisService.getExamStatistics(examId);
  }

  /**
   * GET /grade-analysis/exam/:examId/review
   * Daftar soal yang perlu ditinjau ulang
   */
  @Get('exam/:examId/review')
  @Permissions('view_grades')
  getQuestionsForReview(@Param('examId') examId: string) {
    return this.gradeAnalysisService.getQuestionsForReview(examId);
  }

  /**
   * GET /grade-analysis/class/:classId/subject/:subjectId
   * Analisis nilai per kelas untuk mata pelajaran tertentu
   */
  @Get('class/:classId/subject/:subjectId')
  @Permissions('view_grades')
  getClassSubjectAnalysis(
    @Param('classId') classId: string,
    @Param('subjectId') subjectId: string,
    @Query('batch_id') batchId?: string
  ) {
    return this.gradeAnalysisService.getClassSubjectAnalysis(classId, subjectId, batchId);
  }
}
