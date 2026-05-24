import { Controller, Get, Post, Body, Param, Query, Delete, Patch, UseGuards, Req } from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { BulkCreateAttendanceDto, CreateAttendanceDto, StudentSelfAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@Controller('attendance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Post()
  @Permissions('manage_academic')
  bulkCreate(@Body() data: BulkCreateAttendanceDto) {
    return this.attendancesService.bulkCreate(data);
  }

  @Post('self')
  studentSelfAttendance(@Body() data: StudentSelfAttendanceDto, @Req() req: any) {
    const studentId = req.user.studentId;
    if (!studentId) throw new Error('Only students can perform self-attendance');
    return this.attendancesService.studentSelfAttendance(studentId, data.schedule_id);
  }

  @Get('class/:id')
  @Permissions('view_academic')
  findByClass(@Param('id') classId: string, @Query('date') date: string) {
    return this.attendancesService.findByClass(classId, new Date(date));
  }

  @Get('self-status')
  @Permissions('view_academic')
  getSelfAttendanceStatus(@Query('class_id') classId: string, @Query('date') date: string) {
    return this.attendancesService.getSelfAttendanceStatus(classId, new Date(date));
  }

  @Get('student/:studentId')
  @Permissions('view_academic')
  findByStudentAndSubject(
    @Param('studentId') studentId: string,
    @Query('subject_id') subjectId: string,
  ) {
    return this.attendancesService.findByStudentAndSubject(studentId, subjectId);
  }

  @Get('summary')
  @Permissions('view_academic')
  getSummary(@Query('class_id') class_id?: string, @Query('month') month?: string) {
    return this.attendancesService.getSummary(class_id, month);
  }

  @Get('schedule/:id')
  @Permissions('view_academic')
  findBySchedule(@Param('id') scheduleId: string, @Query('date') date: string) {
    return this.attendancesService.findBySchedule(scheduleId, new Date(date));
  }

  @Patch(':id')
  @Permissions('manage_academic')
  update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendancesService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  @Permissions('manage_academic')
  remove(@Param('id') id: string) {
    return this.attendancesService.remove(id);
  }
}
