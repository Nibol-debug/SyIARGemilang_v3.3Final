import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMajorDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsUUID()
  branch_id: string;
}
