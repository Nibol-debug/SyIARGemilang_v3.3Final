import { Controller, Post, Get, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { ExamSessionsService } from './exam-sessions.service';
import { StartExamDto, SubmitAnswerDto, LogViolationDto, GradeEssayDto } from './dto/exam-session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';

@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamSessionsController {
  constructor(private readonly examSessionsService: ExamSessionsService) {}

  @Post(':id/start')
  startExam(@Param('id') id: string, @Body() data: StartExamDto, @Request() req) {
    return this.examSessionsService.startExam({ studentId: req.user.studentId, examId: id }, data);
  }

  @Post(':id/start-applicant')
  @Public()
  startExamApplicant(
    @Param('id') id: string, 
    @Body() data: StartExamDto & { applicantId: string }
  ) {
    return this.examSessionsService.startExam(
      { applicantId: data.applicantId, examId: id }, 
      data
    );
  }

  @Get('sessions/:sessionId')
  getSessionDetail(@Param('sessionId') sessionId: string) {
    return this.examSessionsService.getSessionDetail(sessionId);
  }

  @Post('sessions/:sessionId/answers')
  @Public() // Allow applicants to submit answers
  submitAnswer(@Param('sessionId') sessionId: string, @Body() data: SubmitAnswerDto) {
    return this.examSessionsService.submitAnswer(sessionId, data);
  }

  @Post('sessions/:sessionId/log')
  @Public() // Allow applicants to log violations
  logViolation(@Param('sessionId') sessionId: string, @Body() data: LogViolationDto) {
    return this.examSessionsService.logViolation(sessionId, data);
  }

  @Post('sessions/:sessionId/submit')
  @Public() // Allow applicants to finalize exam
  submitExam(@Param('sessionId') sessionId: string) {
    return this.examSessionsService.finalizeExam(sessionId);
  }

  @Post('sessions/:sessionId/force-submit')
  @UseGuards(PermissionsGuard)
  @Permissions('manage_exams')
  forceSubmitExam(@Param('sessionId') sessionId: string) {
    return this.examSessionsService.forceSubmit(sessionId);
  }
}
