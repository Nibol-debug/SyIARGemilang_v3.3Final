import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateAppraisalDto {
  @IsString()
  @IsNotEmpty()
  employee_id: string;

  @IsString()
  @IsOptional()
  evaluator_id?: string;

  @IsString()
  @IsNotEmpty()
  period: string;

  @IsNumber()
  @IsNotEmpty()
  discipline_score: number;

  @IsNumber()
  @IsNotEmpty()
  pedagogic_score: number;

  @IsNumber()
  @IsNotEmpty()
  professional_score: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
