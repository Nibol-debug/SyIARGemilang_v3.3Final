import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetLoanDto } from './create-asset-loan.dto';

export class UpdateAssetLoanDto extends PartialType(CreateAssetLoanDto) {}
