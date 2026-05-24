import { Module } from '@nestjs/common';
import { EmployeeHistoryService } from './employee-history.service';
import { EmployeeHistoryController } from './employee-history.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [EmployeeHistoryService, PrismaService],
  controllers: [EmployeeHistoryController],
  exports: [EmployeeHistoryService],
})
export class EmployeeHistoryModule {}
