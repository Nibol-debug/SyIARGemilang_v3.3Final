import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionOptionDto {
  @IsNotEmpty()
  @IsString()
  option_text: string;

  @IsNotEmpty()
  is_correct: boolean;
}

class QuestionDto {
  @IsNotEmpty()
  @IsEnum(['mcq', 'essay'])
  type: string;

  @IsNotEmpty()
  @IsString()
  question_text: string;

  @IsNotEmpty()
  @IsString()
  difficulty: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[];
}

export class CreateExamDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsEnum(['quiz', 'ujian_awal', 'ujian_akhir', 'assignment'])
  type: string;

  @IsNotEmpty()
  @IsUUID()
  subject_id: string;

  @IsNotEmpty()
  @IsUUID()
  major_id: string;

  @IsNotEmpty()
  @IsInt()
  duration: number;

  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  start_time: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  end_time: Date;

  @IsOptional()
  @IsInt()
  violation_limit?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions?: QuestionDto[];
}
