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
  UseInterceptors, 
  UploadedFile 
} from '@nestjs/common';
import { ApplicantsService } from './applicants.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Controller('applicants')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Post()
  @Public()
  create(@Body() createApplicantDto: CreateApplicantDto) {
    return this.applicantsService.create(createApplicantDto);
  }

  @Post('upload-document')
  @Public()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(__dirname, '..', '..', 'uploads', 'applicants'),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadDocument(@UploadedFile() file: Express.Multer.File) {
    return {
      url: `/uploads/applicants/${file.filename}`,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('view_applicants')
  findAll(@Query() query: any) {
    return this.applicantsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('view_applicants')
  findOne(@Param('id') id: string) {
    return this.applicantsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage_applicants')
  update(@Param('id') id: string, @Body() data: any) {
    return this.applicantsService.update(id, data);
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage_applicants')
  verify(@Param('id') id: string, @Body('status') status: string) {
    return this.applicantsService.verify(id, status);
  }

  @Post(':id/accept')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage_applicants')
  accept(@Param('id') id: string) {
    return this.applicantsService.acceptApplicant(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage_applicants')
  remove(@Param('id') id: string) {
    return this.applicantsService.remove(id);
  }
}
