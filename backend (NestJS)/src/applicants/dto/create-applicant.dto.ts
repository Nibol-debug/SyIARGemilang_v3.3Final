import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateApplicantDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsOptional()
  nik?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  birth_place: string;

  @IsString()
  @IsNotEmpty()
  birth_date: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsNotEmpty()
  marital_status: string;

  @IsString()
  @IsNotEmpty()
  education_level: string;

  @IsString()
  @IsNotEmpty()
  father_name: string;

  @IsString()
  @IsNotEmpty()
  mother_name: string;

  @IsString()
  @IsNotEmpty()
  previous_school: string;

  @IsString()
  @IsOptional()
  document_url?: string; // Ijazah

  @IsString()
  @IsOptional()
  ktp_url?: string;

  @IsString()
  @IsOptional()
  kk_url?: string;

  @IsString()
  @IsOptional()
  sktm_url?: string;

  @IsString()
  @IsOptional()
  vaccine_url?: string;

  @IsString()
  @IsOptional()
  health_cert_url?: string;

  @IsString()
  @IsNotEmpty()
  major_id: string;
}
