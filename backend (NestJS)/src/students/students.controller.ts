import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('students')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Permissions('manage_students')
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  findAll(@Query() query: StudentQueryDto) {
    const { page, limit, ...filters } = query;
    return this.studentsService.findAll({ page, limit }, filters);
  }

  @Get('export')
  @Permissions('manage_students')
  export(
    @Res() res: Response,
    @Query('branch_id') branchId?: string,
    @Query('major_id') majorId?: string,
    @Query('class_id') classId?: string,
    @Query('batch_id') batchId?: string,
  ) {
    return this.studentsService.exportToExcel(res, { branch_id: branchId, major_id: majorId, class_id: classId, batch_id: batchId });
  }

  @Post('export-preview')
  @Permissions('manage_students')
  exportPreview(@Body() filters: { branch_id?: string; major_id?: string; class_id?: string; batch_id?: string }) {
    return this.studentsService.exportPreview(filters);
  }

  @Post('import')
  @Permissions('manage_students')
  @UseInterceptors(FileInterceptor('file'))
  import(@UploadedFile() file: Express.Multer.File, @Body('batchId') batchId?: string) {
    return this.studentsService.importFromExcel(file, batchId);
  }

  @Post('import-preview')
  @Permissions('manage_students')
  @UseInterceptors(FileInterceptor('file'))
  importPreview(@UploadedFile() file: Express.Multer.File, @Body('batchId') batchId?: string) {
    return this.studentsService.importPreview(file, batchId);
  }

  @Post('bulk-promote')
  @Permissions('manage_students')
  async bulkPromote(@Body() body: { from_class_id: string; to_class_id: string }) {
    return this.studentsService.bulkPromote(body.from_class_id, body.to_class_id);
  }

  @Post('upload-photo')
  @Permissions('manage_students')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: join(__dirname, '..', '..', '..', 'uploads', 'profiles'),
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        return cb(new Error('Hanya file gambar yang diizinkan (jpeg, jpg, png, gif, webp)'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 },
  }))
  uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    return {
      url: `/uploads/profiles/${file.filename}`,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('manage_students')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Permissions('manage_students')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
