import { Controller, Get, Post, Body, Patch, Put, Param, Delete, Query, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateSalaryConfigDto } from './dto/update-salary-config.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Permissions('manage_hrm')
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('major_id') major_id?: string,
    @Query('search') search?: string,
  ) {
    return this.employeesService.findAll(pagination, { major_id, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('manage_hrm')
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @Permissions('manage_hrm')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  @Get(':id/salary')
  getSalaryConfig(@Param('id') id: string) {
    return this.employeesService.getSalaryConfig(id);
  }

  @Put(':id/salary')
  @Permissions('manage_hrm')
  updateSalaryConfig(@Param('id') id: string, @Body() dto: UpdateSalaryConfigDto) {
    return this.employeesService.updateSalaryConfig(id, dto);
  }

  @Post(':id/documents')
  @Permissions('manage_hrm')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = join(__dirname, '..', '..', 'uploads', 'employees', req.params.id as string);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedMimes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Tipe file tidak didukung. Gunakan PDF, JPG, PNG, atau DOC.'), false);
      }
    },
  }))
  async uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string
  ) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }
    const fileUrl = `/uploads/employees/${id}/${file.filename}`;
    return this.employeesService.addDocument(id, fileUrl, type || 'general');
  }
}
