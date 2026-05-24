import { Module } from '@nestjs/common';
import { GradeAnalysisService } from './grade-analysis.service';
import { GradeAnalysisController } from './grade-analysis.controller';

@Module({
  providers: [GradeAnalysisService],
  controllers: [GradeAnalysisController],
  exports: [GradeAnalysisService],
})
export class GradeAnalysisModule {}
