import { IsOptional, IsString, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateSubjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => (value === '' ? null : value))
  major_id?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passing_grade?: number;
}
