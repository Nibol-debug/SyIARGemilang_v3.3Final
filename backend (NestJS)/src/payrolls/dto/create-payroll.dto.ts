import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreatePayrollDto {
  @IsString()
  @IsNotEmpty()
  employee_id: string;

  @IsNumber()
  @IsNotEmpty()
  month: number;

  @IsNumber()
  @IsNotEmpty()
  year: number;

  @IsNumber()
  @IsNotEmpty()
  basic_salary: number;

  @IsNumber()
  @IsOptional()
  allowances?: number;

  @IsNumber()
  @IsOptional()
  deductions?: number;

  @IsNumber()
  @IsNotEmpty()
  net_salary: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  pdf_url?: string;
}
