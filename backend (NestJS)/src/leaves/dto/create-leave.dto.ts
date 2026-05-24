import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsString()
  @IsOptional()
  employee_id?: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  proof_url?: string;
}
