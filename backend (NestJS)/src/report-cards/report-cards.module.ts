import { Module } from '@nestjs/common';
import { ReportCardsService } from './report-cards.service';
import { ReportCardsController } from './report-cards.controller';

@Module({
  providers: [ReportCardsService],
  controllers: [ReportCardsController],
  exports: [ReportCardsService],
})
export class ReportCardsModule {}
