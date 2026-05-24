import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTeachingLogDto {
  @IsNotEmpty()
  @IsUUID()
  teacher_id: string;

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
  @IsString()
  note: string;

  @IsOptional()
  @IsString()
  material_summary?: string;

  @IsOptional()
  @IsString()
  assignment_given?: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;
}
