import { IsNotEmpty, IsString, IsInt, IsUUID, IsOptional } from 'class-validator';

export class CreateClassDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsInt()
  grade_level: number;

  @IsNotEmpty()
  @IsUUID()
  major_id: string;

  @IsNotEmpty()
  @IsUUID()
  batch_id: string;

  @IsOptional()
  @IsUUID()
  homeroom_teacher_id?: string;
}
