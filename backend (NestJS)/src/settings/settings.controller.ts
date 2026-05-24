import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';
import { UpdateNotificationPreferencesDto, UpdateSystemSettingsDto } from './dto/update-preferences.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(AuditInterceptor)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('preferences')
  getPreferences(@Req() req: any) {
    return this.settingsService.getPreferences(req.user.userId);
  }

  @Patch('preferences/notifications')
  updateNotificationPreferences(
    @Req() req: any,
    @Body() data: UpdateNotificationPreferencesDto,
  ) {
    return this.settingsService.updateNotificationPreferences(req.user.userId, data);
  }

  @Patch('preferences/system')
  @Permissions('manage_users')
  updateSystemSettings(
    @Req() req: any,
    @Body() data: UpdateSystemSettingsDto,
  ) {
    return this.settingsService.updateSystemSettings(req.user.userId, data);
  }

  @Post('preferences/maintenance-mode')
  @Permissions('manage_users')
  toggleMaintenanceMode(
    @Req() req: any,
    @Body('enabled') enabled: boolean,
  ) {
    return this.settingsService.toggleMaintenanceMode(req.user.userId, enabled);
  }
}
