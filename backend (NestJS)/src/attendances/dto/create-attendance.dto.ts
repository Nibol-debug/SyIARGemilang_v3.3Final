import { IsDate, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsUUID()
  student_id: string;

  @IsNotEmpty()
  @IsUUID()
  schedule_id: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsEnum(['hadir', 'sakit', 'izin', 'alfa'])
  status: string;
}

export class StudentSelfAttendanceDto {
  @IsNotEmpty()
  @IsUUID()
  schedule_id: string;
}

export class BulkCreateAttendanceDto {
  @IsNotEmpty()
  @IsUUID()
  schedule_id: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNotEmpty()
  attendances: {
    student_id: string;
    status: string;
  }[];
}
