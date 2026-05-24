import { IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsUUID()
  class_id: string;

  @IsNotEmpty()
  @IsUUID()
  major_id: string;

  @IsNotEmpty()
  @IsUUID()
  batch_id: string;

  @IsNotEmpty()
  @IsUUID()
  subject_id: string;

  @IsNotEmpty()
  @IsUUID()
  teacher_id: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/)
  day: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  start_time: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  end_time: string;

  @IsOptional()
  @IsString()
  room?: string;
}
