import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateEmployeeHistoryDto {
  @IsString()
  @IsNotEmpty()
  employee_id: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}
