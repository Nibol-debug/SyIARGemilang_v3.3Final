import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StudentBehaviorController } from './student-behavior.controller';
import { StudentBehaviorService } from './student-behavior.service';

@Module({
  imports: [PrismaModule],
  controllers: [StudentBehaviorController],
  providers: [StudentBehaviorService],
  exports: [StudentBehaviorService]
})
export class StudentBehaviorModule {}
