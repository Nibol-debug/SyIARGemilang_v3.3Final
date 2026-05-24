import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSalaryConfigDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  basic_salary?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  tunj_masakerja?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  tunj_jabatan?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  tunj_fungsional?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  tunj_keluarga?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  tunj_beras?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  tunj_transport?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  tunj_lainnya?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  pot_alpha?: number;
}
