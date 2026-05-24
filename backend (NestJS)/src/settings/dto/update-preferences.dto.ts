import { IsBoolean, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  notif_academic?: boolean;

  @IsOptional()
  @IsBoolean()
  notif_messages?: boolean;

  @IsOptional()
  @IsBoolean()
  notif_payments?: boolean;

  @IsOptional()
  @IsBoolean()
  notif_email_digest?: boolean;
}

export class UpdateSystemSettingsDto {
  @IsOptional()
  @IsString()
  active_academic_year?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2)
  active_semester?: number;

  @IsOptional()
  @IsBoolean()
  cbt_strict_anticheat?: boolean;

  @IsOptional()
  @IsBoolean()
  cbt_show_score_auto?: boolean;

  @IsOptional()
  @IsBoolean()
  cbt_random_questions?: boolean;

  @IsOptional()
  @IsBoolean()
  cbt_device_locking?: boolean;

  @IsOptional()
  @IsBoolean()
  maintenance_mode?: boolean;
}
