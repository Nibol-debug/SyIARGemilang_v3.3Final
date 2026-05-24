import { Module } from '@nestjs/common';
import { AppraisalsService } from './appraisals.service';
import { AppraisalsController } from './appraisals.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [AppraisalsService, PrismaService],
  controllers: [AppraisalsController],
  exports: [AppraisalsService],
})
export class AppraisalsModule {}
