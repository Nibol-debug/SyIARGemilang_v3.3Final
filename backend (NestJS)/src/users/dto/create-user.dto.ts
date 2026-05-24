import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password_hash: string; // This is actually the plain password when creating from admin

  @IsNotEmpty()
  @IsUUID()
  role_id: string;

  @IsOptional()
  @IsUUID()
  student_id?: string;

  @IsOptional()
  @IsUUID()
  employee_id?: string;
}
