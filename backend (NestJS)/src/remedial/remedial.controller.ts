import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RemedialService } from './remedial.service';
import { CreateRemedialDto, ScheduleRemedialDto, UpdateRemedialScoreDto, FindAllRemedialDto } from './dto/remedial.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('remedial')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RemedialController {
  constructor(private readonly remedialService: RemedialService) {}

  /**
   * GET /remedial/needs
   * Daftar siswa yang perlu remedial untuk mapel tertentu
   */
  @Get('needs')
  @Permissions('view_grades')
  getStudentsNeedingRemedial(
    @Query('subject_id') subjectId: string,
    @Query('class_id') classId?: string,
    @Query('semester') semester?: string,
  ) {
    return this.remedialService.getStudentsNeedingRemedial(
      subjectId,
      classId,
      semester ? parseInt(semester) : undefined,
    );
  }

  /**
   * GET /remedial/stats
   * Statistik remedial
   */
  @Get('stats')
  @Permissions('view_grades')
  getStats() {
    return this.remedialService.getStats();
  }

  /**
   * GET /remedial
   * List semua remedial dengan filter
   */
  @Get()
  @Permissions('view_grades')
  findAll(
    @Query('status') status?: string,
    @Query('subject_id') subjectId?: string,
    @Query('student_id') studentId?: string,
    @Query('semester') semester?: string,
  ) {
    return this.remedialService.findAll({
      status,
      subject_id: subjectId,
      student_id: studentId,
      semester: semester ? parseInt(semester) : undefined,
    });
  }

  /**
   * GET /remedial/:id
   * Detail remedial
   */
  @Get(':id')
  @Permissions('view_grades')
  findOne(@Param('id') id: string) {
    return this.remedialService.findOne(id);
  }

  /**
   * POST /remedial
   * Create remedial record
   */
  @Post()
  @Permissions('manage_grades')
  create(@Body() createRemedialDto: CreateRemedialDto) {
    return this.remedialService.create(createRemedialDto);
  }

  /**
   * PUT /remedial/:id/schedule
   * Jadwal remedial
   */
  @Put(':id/schedule')
  @Permissions('manage_grades')
  schedule(@Param('id') id: string, @Body() data: ScheduleRemedialDto) {
    return this.remedialService.schedule(id, data);
  }

  /**
   * PUT /remedial/:id/score
   * Update nilai setelah remedial
   */
  @Put(':id/score')
  @Permissions('manage_grades')
  updateScore(@Param('id') id: string, @Body() data: UpdateRemedialScoreDto) {
    return this.remedialService.updateScore(id, data);
  }

  /**
   * DELETE /remedial/:id
   * Hapus remedial record
   */
  @Delete(':id')
  @Permissions('manage_grades')
  remove(@Param('id') id: string) {
    return this.remedialService.remove(id);
  }
}
