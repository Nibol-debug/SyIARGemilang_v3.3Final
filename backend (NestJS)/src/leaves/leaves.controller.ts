import { Controller, Get, Post, Body, Patch, Param, Query, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { CreateLeaveRequestDto } from './dto/create-leave.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import type { ActiveUser } from '../common/interfaces/active-user.interface';
import { GetUser } from '../auth/get-user.decorator';

@Controller('leaves')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  create(@Body() createLeaveRequestDto: CreateLeaveRequestDto, @GetUser() user: ActiveUser) {
    const employeeId = createLeaveRequestDto.employee_id || user.employeeId;
    if (!employeeId) {
      throw new BadRequestException('Akun Anda tidak terhubung dengan data pegawai. Hubungi admin.');
    }
    const leaveData = {
      ...createLeaveRequestDto,
      employee_id: employeeId,
    };
    return this.leavesService.create(leaveData);
  }

  @Post(':id/proof')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = join(__dirname, '..', '..', 'uploads', 'leaves', req.params.id as string);
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
        'image/jpg',
      ];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Tipe file tidak didukung. Gunakan PDF, JPG, atau PNG.'), false);
      }
    },
  }))
  async uploadProof(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }
    const fileUrl = `/uploads/leaves/${id}/${file.filename}`;
    return this.leavesService.updateProof(id, fileUrl);
  }

  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
    @Query('employee_id') employee_id?: string,
  ) {
    return this.leavesService.findAll(pagination, { status, employee_id });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leavesService.findOne(id);
  }

  @Patch(':id/approve')
  @Permissions('manage_hrm')
  approve(@Param('id') id: string, @GetUser() user: ActiveUser) {
    return this.leavesService.approve(id, user.sub);
  }

  @Patch(':id/reject')
  @Permissions('manage_hrm')
  reject(@Param('id') id: string, @GetUser() user: ActiveUser) {
    return this.leavesService.reject(id, user.sub);
  }
}
