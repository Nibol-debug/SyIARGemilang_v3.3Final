import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto';
import { UpdateSystemSettingsDto } from './dto/update-preferences.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getPreferences(userId: string) {
    let preferences = await this.prisma.userPreferences.findUnique({
      where: { user_id: userId },
    });

    if (!preferences) {
      preferences = await this.prisma.userPreferences.create({
        data: { user_id: userId },
      });
    }

    return preferences;
  }

  async updateNotificationPreferences(
    userId: string,
    data: UpdateNotificationPreferencesDto,
  ) {
    const existing = await this.getPreferences(userId);

    return this.prisma.userPreferences.update({
      where: { id: existing.id },
      data: {
        notif_academic: data.notif_academic ?? existing.notif_academic,
        notif_messages: data.notif_messages ?? existing.notif_messages,
        notif_payments: data.notif_payments ?? existing.notif_payments,
        notif_email_digest: data.notif_email_digest ?? existing.notif_email_digest,
      },
    });
  }

  async updateSystemSettings(userId: string, data: UpdateSystemSettingsDto) {
    const existing = await this.getPreferences(userId);

    const updateData: any = {};
    if (data.active_academic_year !== undefined) updateData.active_academic_year = data.active_academic_year;
    if (data.active_semester !== undefined) updateData.active_semester = data.active_semester;
    if (data.cbt_strict_anticheat !== undefined) updateData.cbt_strict_anticheat = data.cbt_strict_anticheat;
    if (data.cbt_show_score_auto !== undefined) updateData.cbt_show_score_auto = data.cbt_show_score_auto;
    if (data.cbt_random_questions !== undefined) updateData.cbt_random_questions = data.cbt_random_questions;
    if (data.cbt_device_locking !== undefined) updateData.cbt_device_locking = data.cbt_device_locking;
    if (data.maintenance_mode !== undefined) updateData.maintenance_mode = data.maintenance_mode;

    return this.prisma.userPreferences.update({
      where: { id: existing.id },
      data: updateData,
    });
  }

  async toggleMaintenanceMode(userId: string, enabled: boolean) {
    const existing = await this.getPreferences(userId);

    return this.prisma.userPreferences.update({
      where: { id: existing.id },
      data: { maintenance_mode: enabled },
    });
  }
}
