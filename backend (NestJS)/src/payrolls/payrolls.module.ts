import { Module } from '@nestjs/common';
import { PayrollsService } from './payrolls.service';
import { PayrollsController } from './payrolls.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PayrollsService, PrismaService],
  controllers: [PayrollsController],
  exports: [PayrollsService],
})
export class PayrollsModule {}
