import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BulkCreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendancesService {
  constructor(private prisma: PrismaService) {}

  async bulkCreate(data: BulkCreateAttendanceDto) {
    await this.prisma.attendance.deleteMany({
      where: {
        schedule_id: data.schedule_id,
        date: data.date,
      },
    });

    const records = data.attendances.map((a) => ({
      schedule_id: data.schedule_id,
      date: data.date,
      student_id: a.student_id,
      status: a.status,
    }));

    return this.prisma.attendance.createMany({
      data: records,
    });
  }

  async studentSelfAttendance(studentId: string, scheduleId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendance.findFirst({
      where: {
        student_id: studentId,
        schedule_id: scheduleId,
        date: today,
      }
    });

    if (existing) {
      if (existing.status !== 'hadir') {
        // Jika statusnya bukan 'hadir' (misal: 'alfa' dari guru), izinkan update ke 'hadir'
        return this.prisma.attendance.update({
          where: { id: existing.id },
          data: { status: 'hadir' }
        });
      }
      throw new NotFoundException('Anda sudah melakukan presensi untuk jadwal ini hari ini');
    }

    return this.prisma.attendance.create({
      data: {
        student_id: studentId,
        schedule_id: scheduleId,
        date: today,
        status: 'hadir',
      }
    });
  }

  async findByClass(classId: string, date: Date) {
    return this.prisma.attendance.findMany({
      where: {
        date,
        schedule: { class_id: classId },
      },
      include: {
        student: true,
        schedule: {
          include: { subject: true },
        },
      },
    });
  }

  async getSummary(class_id?: string, month?: string) {
    const where: any = {};
    if (class_id) {
      where.schedule = { class_id };
    }
    if (month) {
      const [year, m] = month.split('-').map(Number);
      where.date = {
        gte: new Date(year, m - 1, 1),
        lt: new Date(year, m, 1),
      };
    }

    const attendances = await this.prisma.attendance.findMany({
      where,
      select: { status: true },
    });

    const total = attendances.length;
    const hadir = attendances.filter((a) => a.status === 'hadir').length;
    const sakit = attendances.filter((a) => a.status === 'sakit').length;
    const izin = attendances.filter((a) => a.status === 'izin').length;
    const alfa = attendances.filter((a) => a.status === 'alfa').length;

    return { total, hadir, sakit, izin, alfa };
  }

  async findBySchedule(scheduleId: string, date: Date) {
    return this.prisma.attendance.findMany({
      where: {
        schedule_id: scheduleId,
        date,
      },
      include: {
        student: true,
        schedule: {
          include: { subject: true, class: true, teacher: true },
        },
      },
    });
  }

  async update(id: string, data: UpdateAttendanceDto) {
    const attendance = await this.prisma.attendance.findUnique({ where: { id } });
    if (!attendance) throw new NotFoundException('Attendance record not found');
    return this.prisma.attendance.update({
      where: { id },
      data: { status: data.status },
      include: {
        student: true,
        schedule: { include: { subject: true } },
      },
    });
  }

  async remove(id: string) {
    const attendance = await this.prisma.attendance.findUnique({ where: { id } });
    if (!attendance) throw new NotFoundException('Attendance record not found');
    return this.prisma.attendance.delete({ where: { id } });
  }

  async getSelfAttendanceStatus(classId: string, date: Date) {
    const students = await this.prisma.student.findMany({
      where: { class_id: classId, status: 'active' },
      select: { id: true, nis: true, full_name: true }
    });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendances = await this.prisma.attendance.findMany({
      where: {
        student_id: { in: students.map(s => s.id) },
        date: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        schedule: {
          include: { subject: true }
        }
      }
    });

    const attendanceByStudent: Record<string, any[]> = {};
    attendances.forEach(a => {
      if (!attendanceByStudent[a.student_id]) attendanceByStudent[a.student_id] = [];
      attendanceByStudent[a.student_id].push(a);
    });

    return students.map(student => {
      const studentRecords = attendanceByStudent[student.id] || [];
      return {
        id: student.id,
        nis: student.nis,
        full_name: student.full_name,
        has_self_attended: studentRecords.some(r => r.status === 'hadir'),
        total_attended: studentRecords.filter(r => r.status === 'hadir').length,
        attendances: studentRecords,
      };
    });
  }

  async findByStudentAndSubject(studentId: string, subjectId: string) {
    const schedules = await this.prisma.schedule.findMany({
      where: { subject_id: subjectId },
      select: { id: true }
    });

    if (schedules.length === 0) return [];

    const scheduleIds = schedules.map(s => s.id);

    const attendances = await this.prisma.attendance.findMany({
      where: {
        student_id: studentId,
        schedule_id: { in: scheduleIds }
      },
      include: {
        schedule: {
          include: { subject: true, class: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    const total = attendances.length;
    const hadir = attendances.filter(a => a.status === 'hadir').length;
    const sakit = attendances.filter(a => a.status === 'sakit').length;
    const izin = attendances.filter(a => a.status === 'izin').length;
    const alfa = attendances.filter(a => a.status === 'alfa').length;

    return {
      total,
      hadir,
      sakit,
      izin,
      alfa,
      presensi_score: total > 0 ? Math.round((hadir / total) * 100) : 0,
      records: attendances,
    };
  }
}
