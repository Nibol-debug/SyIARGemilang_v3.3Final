import { IsNotEmpty, IsString, IsDate, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBatchDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  start_date: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  end_date: Date;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
