import { IsNotEmpty, IsOptional, IsUUID, IsDateString, IsDecimal, Min, Max, IsInt } from 'class-validator';

export class CreateRemedialDto {
  @IsNotEmpty()
  @IsUUID()
  student_id: string;

  @IsNotEmpty()
  @IsUUID()
  subject_id: string;

  @IsOptional()
  @IsUUID()
  batch_id?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2)
  semester?: number;

  @IsOptional()
  @IsUUID()
  exam_id?: string;

  @IsOptional()
  @IsDecimal()
  @Min(0)
  @Max(100)
  score_before?: number;

  @IsOptional()
  @IsDateString()
  scheduled_at?: string;

  @IsOptional()
  notes?: string;
}

export class ScheduleRemedialDto {
  @IsNotEmpty()
  @IsUUID()
  exam_id: string;

  @IsNotEmpty()
  @IsDateString()
  scheduled_at: string;
}

export class UpdateRemedialScoreDto {
  @IsNotEmpty()
  @IsDecimal()
  @Min(0)
  @Max(100)
  score_after: number;

  @IsOptional()
  notes?: string;
}

export class FindAllRemedialDto {
  @IsOptional()
  status?: string;

  @IsOptional()
  @IsUUID()
  subject_id?: string;

  @IsOptional()
  @IsUUID()
  student_id?: string;

  @IsOptional()
  @IsInt()
  semester?: number;
}