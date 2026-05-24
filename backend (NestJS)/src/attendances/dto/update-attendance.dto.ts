import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateAttendanceDto {
  @IsNotEmpty()
  @IsEnum(['hadir', 'sakit', 'izin', 'alfa'])
  status: string;
}
