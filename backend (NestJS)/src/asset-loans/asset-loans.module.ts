import { Module } from '@nestjs/common';
import { AssetLoansService } from './asset-loans.service';
import { AssetLoansController } from './asset-loans.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [AssetLoansService, PrismaService],
  controllers: [AssetLoansController],
  exports: [AssetLoansService],
})
export class AssetLoansModule {}
