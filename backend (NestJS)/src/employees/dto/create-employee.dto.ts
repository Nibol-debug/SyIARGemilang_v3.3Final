import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsString()
  education: string;

  @IsNotEmpty()
  @IsString()
  position: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  join_date: Date;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  education_institution?: string;

  @IsOptional()
  @IsString()
  education_degree?: string;

  @IsOptional()
  @IsString()
  education_graduation_year?: string;

  @IsOptional()
  @IsString()
  teaching_specialty?: string;

  @IsOptional()
  @IsString()
  current_rank?: string;

  @IsOptional()
  @IsString()
  current_golongan?: string;

  @IsOptional()
  @IsString()
  certification_status?: string;

  @IsOptional()
  @IsBoolean()
  is_certified?: boolean;

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => (value === '' ? null : value))
  major_id?: string;
}
