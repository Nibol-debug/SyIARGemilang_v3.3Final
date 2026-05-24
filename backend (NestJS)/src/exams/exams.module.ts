import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { QuestionBanksService } from './question-banks.service';
import { QuestionBanksController } from './question-banks.controller';

@Module({
  providers: [ExamsService, QuestionBanksService],
  controllers: [ExamsController, QuestionBanksController]
})
export class ExamsModule {}
