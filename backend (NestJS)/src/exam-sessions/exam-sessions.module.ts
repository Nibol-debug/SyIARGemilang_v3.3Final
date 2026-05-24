import { Module } from '@nestjs/common';
import { ExamSessionsService } from './exam-sessions.service';
import { ExamSessionsController } from './exam-sessions.controller';

@Module({
  providers: [ExamSessionsService],
  controllers: [ExamSessionsController]
})
export class ExamSessionsModule {}
