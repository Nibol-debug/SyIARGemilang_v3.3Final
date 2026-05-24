import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class ExamAnalysisDto {
  @IsNotEmpty()
  @IsUUID()
  examId: string;
}

export class ClassSubjectAnalysisDto {
  @IsNotEmpty()
  @IsUUID()
  classId: string;

  @IsNotEmpty()
  @IsUUID()
  subjectId: string;

  @IsOptional()
  @IsUUID()
  batchId?: string;
}

export class QuestionAnalysisDto {
  @IsNotEmpty()
  @IsUUID()
  questionId: string;
}

export interface QuestionStatistic {
  id: string;
  question_text: string;
  type: 'mcq' | 'essay';
  difficulty: string;
  total_attempts: number;
  correct_count: number;
  correct_percentage: number;
  discrimination_index?: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
}

export interface ClassGradeDistribution {
  grade_range: string;
  count: number;
  percentage: number;
}

export interface AnalysisSummary {
  exam_title: string;
  subject_name: string;
  total_students: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  standard_deviation: number;
  questions: QuestionStatistic[];
  grade_distribution: ClassGradeDistribution[];
}
