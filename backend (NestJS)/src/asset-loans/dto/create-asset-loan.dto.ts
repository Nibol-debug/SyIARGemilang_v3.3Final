import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateAssetLoanDto {
  @IsString()
  @IsNotEmpty()
  asset_id: string;

  @IsString()
  @IsNotEmpty()
  employee_id: string;

  @IsDateString()
  @IsOptional()
  loan_date?: string;

  @IsDateString()
  @IsOptional()
  expected_return_date?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
