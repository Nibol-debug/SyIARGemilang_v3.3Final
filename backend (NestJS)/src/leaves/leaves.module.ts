import { Module } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [LeavesService, PrismaService],
  controllers: [LeavesController],
  exports: [LeavesService],
})
export class LeavesModule {}
