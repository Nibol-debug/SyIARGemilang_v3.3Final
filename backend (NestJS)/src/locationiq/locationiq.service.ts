import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LocationiqService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://us1.locationiq.com/v1';

  constructor(private readonly httpService: HttpService) {
    this.apiKey = process.env.LOCATIONIQ_API_KEY || '';
  }

  async reverse(lat: number, lng: number) {
    if (!this.apiKey) {
      return { error: 'LOCATIONIQ_API_KEY not configured' };
    }
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/reverse`, {
        params: { key: this.apiKey, lat, lon: lng, format: 'json' },
      }),
    );
    return data;
  }

  async search(query: string) {
    if (!this.apiKey) {
      return { error: 'LOCATIONIQ_API_KEY not configured' };
    }
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/search`, {
        params: { key: this.apiKey, q: query, format: 'json' },
      }),
    );
    return data;
  }
}
