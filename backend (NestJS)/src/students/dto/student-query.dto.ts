import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class StudentQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  class_id?: string;

  @IsOptional()
  @IsString()
  branch_id?: string;

  @IsOptional()
  @IsString()
  major_id?: string;

  @IsOptional()
  @IsString()
  batch_id?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
