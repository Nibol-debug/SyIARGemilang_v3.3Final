import { IsNotEmpty, IsOptional, IsString, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSubjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => (value === '' ? null : value))
  major_id?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passing_grade?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  hours_per_week?: number;

  @IsOptional()
  @IsString()
  competency_standards?: string;
}
