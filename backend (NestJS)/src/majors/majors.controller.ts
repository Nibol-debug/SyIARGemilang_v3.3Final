import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MajorsService } from './majors.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('majors')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MajorsController {
  constructor(private readonly majorsService: MajorsService) {}

  @Post()
  @Permissions('manage_majors')
  create(@Body() createMajorDto: CreateMajorDto) {
    return this.majorsService.create(createMajorDto);
  }

  @Get()
  @Public()
  findAll(@Query() paginationDto: PaginationDto, @Query('branch_id') branchId?: string) {
    return this.majorsService.findAll(paginationDto, branchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.majorsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('manage_majors')
  update(@Param('id') id: string, @Body() updateMajorDto: UpdateMajorDto) {
    return this.majorsService.update(id, updateMajorDto);
  }

  @Delete(':id')
  @Permissions('manage_majors')
  remove(@Param('id') id: string) {
    return this.majorsService.remove(id);
  }
}
