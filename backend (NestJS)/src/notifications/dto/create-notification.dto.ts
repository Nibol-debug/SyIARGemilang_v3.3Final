import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  type: string; // payment, exam, announcement, attendance, ppdb

  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsBoolean()
  @IsOptional()
  is_read?: boolean;
}
