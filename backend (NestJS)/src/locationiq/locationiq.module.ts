import { Module } from '@nestjs/common';
import { LocationiqController } from './locationiq.controller';
import { LocationiqService } from './locationiq.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [LocationiqController],
  providers: [LocationiqService],
})
export class LocationiqModule {}
