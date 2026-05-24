import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { AppraisalsService } from './appraisals.service';
import { CreateAppraisalDto } from './dto/create-appraisal.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import type { ActiveUser } from '../common/interfaces/active-user.interface';
import { GetUser } from '../auth/get-user.decorator';

@Controller('appraisals')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AppraisalsController {
  constructor(private readonly appraisalsService: AppraisalsService) {}

  @Post()
  @Permissions('manage_hrm')
  create(@Body() createAppraisalDto: CreateAppraisalDto, @GetUser() user: ActiveUser) {
    if (!user.employeeId) {
      throw new BadRequestException('Akun Anda tidak terhubung dengan data pegawai. Hubungi admin.');
    }
    const appraisalData = {
      ...createAppraisalDto,
      evaluator_id: user.employeeId,
    };
    return this.appraisalsService.create(appraisalData);
  }

  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('employee_id') employee_id?: string,
    @Query('evaluator_id') evaluator_id?: string,
    @Query('period') period?: string,
  ) {
    return this.appraisalsService.findAll(pagination, { employee_id, evaluator_id, period });
  }

  @Get('me')
  getMyAppraisals(
    @GetUser() user: ActiveUser,
    @Query() pagination: PaginationDto,
  ) {
    return this.appraisalsService.findAll(pagination, { employee_id: user.employeeId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appraisalsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('manage_hrm')
  update(@Param('id') id: string, @Body() updateAppraisalDto: any) {
    return this.appraisalsService.update(id, updateAppraisalDto);
  }

  @Delete(':id')
  @Permissions('manage_hrm')
  remove(@Param('id') id: string) {
    return this.appraisalsService.remove(id);
  }

  @Get('discipline-score/:employeeId')
  async getDisciplineScore(
    @Param('employeeId') employeeId: string,
    @Query('period') period: string,
  ) {
    const score = await this.appraisalsService.calculateDisciplineScore(employeeId, period);
    return { employee_id: employeeId, period, discipline_score: score };
  }
}
