import { Controller, Get, Post, Body, Param, Query, UseGuards, Patch, Delete } from '@nestjs/common';
import { QuestionBanksService } from './question-banks.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('question-banks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class QuestionBanksController {
  constructor(private readonly questionBanksService: QuestionBanksService) {}

  @Post()
  @Permissions('manage_exams')
  create(@Body() data: any) {
    return this.questionBanksService.create(data);
  }

  @Post('bulk')
  @Permissions('manage_exams')
  createBulk(@Body() data: any[]) {
    return this.questionBanksService.createBulk(data);
  }

  @Get()
  @Permissions('view_exams')
  findAll(
    @Query() pagination: PaginationDto,
    @Query('major_id') major_id?: string,
    @Query('subject_id') subject_id?: string,
    @Query('search') search?: string,
  ) {
    return this.questionBanksService.findAll(pagination, { major_id, subject_id, search });
  }

  @Get(':id')
  @Permissions('view_exams')
  findOne(@Param('id') id: string) {
    return this.questionBanksService.findOne(id);
  }

  @Patch(':id')
  @Permissions('manage_exams')
  update(@Param('id') id: string, @Body() data: any) {
    return this.questionBanksService.update(id, data);
  }

  @Delete(':id')
  @Permissions('manage_exams')
  remove(@Param('id') id: string) {
    return this.questionBanksService.remove(id);
  }

  @Post('import-to-exam/:examId')
  @Permissions('manage_exams')
  importToExam(@Param('examId') examId: string, @Body('question_bank_ids') questionBankIds: string[]) {
    return this.questionBanksService.importToExam(examId, questionBankIds);
  }
}
