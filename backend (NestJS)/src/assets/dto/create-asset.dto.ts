import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsEnum(['good', 'fair', 'broken'])
  condition: string;

  @IsString()
  @IsEnum(['available', 'loaned', 'maintenance'])
  @IsOptional()
  status?: string;
}
