import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { LocationiqService } from './locationiq.service';

@Controller('locationiq')
export class LocationiqController {
  constructor(private readonly locationiqService: LocationiqService) {}

  @Get('reverse')
  async reverse(@Query('lat') lat: string, @Query('lng') lng: string) {
    if (!lat || !lng) {
      throw new BadRequestException('lat and lng are required');
    }
    return this.locationiqService.reverse(parseFloat(lat), parseFloat(lng));
  }

  @Get('search')
  async search(@Query('q') q: string) {
    if (!q) {
      throw new BadRequestException('q (query) is required');
    }
    return this.locationiqService.search(q);
  }
}
