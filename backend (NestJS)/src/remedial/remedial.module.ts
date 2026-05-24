import { Module } from '@nestjs/common';
import { RemedialService } from './remedial.service';
import { RemedialController } from './remedial.controller';

@Module({
  providers: [RemedialService],
  controllers: [RemedialController],
  exports: [RemedialService],
})
export class RemedialModule {}
