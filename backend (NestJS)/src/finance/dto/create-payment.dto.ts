import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  student_id: string;

  @IsString()
  @IsNotEmpty()
  fee_id: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['cash', 'transfer', 'gateway'])
  method: string;

  @IsString()
  @IsOptional()
  @IsEnum(['pending', 'success', 'failed'])
  status?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}
