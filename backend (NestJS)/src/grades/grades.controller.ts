import { Controller, Get, Post, Body, Param, Query, UseGuards, Put } from '@nestjs/common';
import { GradesService } from './grades.service';
import { CreateGradeDto, FinalizeGradeDto, FinalizeClassGradeDto, FinalizeAllClassGradeDto, UpdateGradeComponentDto } from './dto/grade.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('grades')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get('stats/grading')
  @Permissions('view_grades')
  getGradingStats() {
    return this.gradesService.getGradingStats();
  }

  @Get('components')
  @Permissions('view_grades')
  getGradeComponents() {
    return this.gradesService.getGradeComponents();
  }

  @Put('components')
  @Permissions('manage_grades')
  updateGradeComponent(@Body() updateGradeComponentDto: UpdateGradeComponentDto) {
    return this.gradesService.updateGradeComponent(updateGradeComponentDto);
  }

  @Post()
  @Permissions('manage_grades')
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradesService.create(createGradeDto);
  }

  @Get('student/:id')
  findByStudent(@Param('id') studentId: string, @Query() pagination: PaginationDto) {
    return this.gradesService.findByStudent(studentId, pagination);
  }

  @Post('finalize')
  @Permissions('manage_grades')
  finalize(@Body() finalizeGradeDto: FinalizeGradeDto) {
    return this.gradesService.finalizeGrade(finalizeGradeDto);
  }

  @Post('finalize-class')
  @Permissions('manage_grades')
  finalizeClass(@Body() finalizeClassGradeDto: FinalizeClassGradeDto) {
    return this.gradesService.finalizeClassGrades(finalizeClassGradeDto);
  }

  @Post('finalize-all-class')
  @Permissions('manage_grades')
  finalizeAllClass(@Body() finalizeAllClassGradeDto: FinalizeAllClassGradeDto) {
    return this.gradesService.finalizeAllClassGrades(finalizeAllClassGradeDto);
  }

  @Get('final/:student_id')
  getFinalReport(@Param('student_id') studentId: string) {
    return this.gradesService.getFinalReport(studentId);
  }

  @Get('class/:class_id')
  findByClass(@Param('class_id') classId: string, @Query('subject_id') subjectId: string) {
    return this.gradesService.findByClass(classId, subjectId);
  }

  /**
   * GET /grades/parent/:student_id
   * Portal orang tua untuk melihat nilai anak
   */
  @Get('parent/:student_id')
  @Permissions('view_grades')
  getParentPortalData(@Param('student_id') studentId: string) {
    return this.gradesService.getParentPortalData(studentId);
  }
}
