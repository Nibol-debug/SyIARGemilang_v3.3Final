import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() body: LoginDto) {
    try {
      const user = await this.authService.validateUser(body.username, body.password);
      if (!user) {
        throw new UnauthorizedException('Username atau password salah');
      }
      return this.authService.login(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[LOGIN_ERROR] body=${JSON.stringify({u:body?.username?.length, p:body?.password?.length ? '***' : ''})} error=${msg}`);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout() {
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('devices')
  async registerDevice(@Request() req, @Body() body: { device_id: string }) {
    return this.authService.registerDevice(req.user.userId, body.device_id);
  }
}
