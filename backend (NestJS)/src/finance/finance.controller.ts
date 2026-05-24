import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UseGuards, BadRequestException } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { FinanceQueryDto } from './dto/finance-query.dto';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('finance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(AuditInterceptor)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Fees
  @Post('fees')
  @Permissions('manage_finance')
  createFee(@Body() createFeeDto: CreateFeeDto) {
    return this.financeService.createFee(createFeeDto);
  }

  @Get('fees')
  @Permissions('view_finance')
  findAllFees(@Query() query: FinanceQueryDto) {
    const { page, limit, ...filters } = query;
    return this.financeService.findAllFees({ page, limit }, filters);
  }

  @Get('fees/:id')
  @Permissions('view_finance')
  findOneFee(@Param('id') id: string) {
    return this.financeService.findOneFee(id);
  }

  @Patch('fees/:id')
  @Permissions('manage_finance')
  updateFee(@Param('id') id: string, @Body() updateFeeDto: UpdateFeeDto) {
    return this.financeService.updateFee(id, updateFeeDto);
  }

  @Delete('fees/:id')
  @Permissions('manage_finance')
  removeFee(@Param('id') id: string) {
    return this.financeService.removeFee(id);
  }

  // Payments
  @Post('payments')
  @Permissions('manage_finance')
  createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.financeService.createPayment(createPaymentDto);
  }

  @Get('payments')
  @Permissions('view_finance')
  findAllPayments(@Query() query: FinanceQueryDto) {
    const { page, limit, ...filters } = query;
    return this.financeService.findAllPayments({ page, limit }, filters);
  }

  @Get('payments/:id')
  @Permissions('view_finance')
  findOnePayment(@Param('id') id: string) {
    return this.financeService.findOnePayment(id);
  }

  @Patch('payments/:id')
  @Permissions('manage_finance')
  updatePayment(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.financeService.updatePayment(id, updatePaymentDto);
  }

  @Delete('payments/:id')
  @Permissions('manage_finance')
  removePayment(@Param('id') id: string) {
    return this.financeService.removePayment(id);
  }

  @Post('remind')
  @Permissions('manage_finance')
  sendPaymentReminders() {
    return this.financeService.sendPaymentReminders();
  }
}
