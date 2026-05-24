import { Module } from '@nestjs/common';
import { TeachingLogsService } from './teaching-logs.service';
import { TeachingLogsController } from './teaching-logs.controller';

@Module({
  providers: [TeachingLogsService],
  controllers: [TeachingLogsController]
})
export class TeachingLogsModule {}
