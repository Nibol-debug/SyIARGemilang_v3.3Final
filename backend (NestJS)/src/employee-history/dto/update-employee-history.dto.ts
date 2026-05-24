import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeHistoryDto } from './create-employee-history.dto';

export class UpdateEmployeeHistoryDto extends PartialType(CreateEmployeeHistoryDto) {}
