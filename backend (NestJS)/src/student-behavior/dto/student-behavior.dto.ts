import { IsNotEmpty, IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateBehaviorDto {
  @IsNotEmpty()
  @IsString()
  student_id: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  attitude: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  ethics: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  manners: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  date?: string;
}

export class UpdateBehaviorDto {
  @IsOptional()
  @IsString()
  student_id?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  attitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  ethics?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  manners?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  date?: string;
}
