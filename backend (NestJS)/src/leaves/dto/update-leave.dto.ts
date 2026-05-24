import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaveRequestDto } from './create-leave.dto';

export class UpdateLeaveRequestDto extends PartialType(CreateLeaveRequestDto) {}
