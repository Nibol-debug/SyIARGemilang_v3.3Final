import { IsDecimal, IsEnum, IsNotEmpty, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class CreateGradeDto {
  @IsNotEmpty()
  @IsUUID()
  student_id: string;

  @IsNotEmpty()
  @IsUUID()
  subject_id: string;

  @IsNotEmpty()
  @IsEnum(['assignment', 'ujian_awal', 'ujian_akhir', 'quiz', 'presensi'])
  type: string;

  @IsNotEmpty()
  @Min(0)
  @Max(100)
  score: number;

  @IsOptional()
  @Min(0)
  @Max(1)
  weight?: number;

  @IsOptional()
  @IsUUID()
  exam_id?: string;
}

export class FinalizeGradeDto {
  @IsNotEmpty()
  @IsUUID()
  student_id: string;

  @IsNotEmpty()
  @IsUUID()
  subject_id: string;

  @IsNotEmpty()
  semester: number;
}

export class FinalizeClassGradeDto {
  @IsNotEmpty()
  @IsUUID()
  class_id: string;

  @IsNotEmpty()
  @IsUUID()
  subject_id: string;

  @IsNotEmpty()
  semester: number;
}

export class FinalizeAllClassGradeDto {
  @IsNotEmpty()
  @IsUUID()
  class_id: string;

  @IsNotEmpty()
  semester: number;
}

export class UpdateGradeComponentDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @Min(0)
  @Max(100)
  weight_percentage: number;
}
