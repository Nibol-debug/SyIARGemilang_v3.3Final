import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [students, employees, activeExams, totalFees, paidPayments, pendingPayments] = await Promise.all([
      this.prisma.student.count({ where: { status: 'active' } }),
      this.prisma.employee.count({ where: { status: 'active' } }),
      this.prisma.exam.count({ where: { end_time: { gte: new Date() } } }),
      this.prisma.fee.count(),
      this.prisma.payment.count({ where: { status: 'success' } }),
      this.prisma.payment.count({ where: { status: 'pending' } }),
    ]);

    return {
      total_active_students: students,
      total_employees: employees,
      active_exams: activeExams,
      total_fees: totalFees,
      paid_payments: paidPayments,
      pending_payments: pendingPayments,
    };
  }

  async getAttendanceReport(month?: string) {
    const [year, m] = month ? month.split('-').map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
    const startDate = new Date(year, m - 1, 1);
    const endDate = new Date(year, m, 0, 23, 59, 59, 999);

    const [studentAttendance, employeeAttendance] = await Promise.all([
      this.prisma.attendance.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        select: { status: true },
      }),
      this.prisma.employeeAttendance.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        select: { status: true },
      }),
    ]);

    const countByStatus = (records: { status: string }[], statuses: string[]) =>
      records.filter(r => statuses.includes(r.status)).length;

    return {
      month: `${year}-${String(m).padStart(2, '0')}`,
      student: {
        total: studentAttendance.length,
        hadir: countByStatus(studentAttendance, ['hadir']),
        sakit: countByStatus(studentAttendance, ['sakit']),
        izin: countByStatus(studentAttendance, ['izin']),
        alfa: countByStatus(studentAttendance, ['alfa']),
      },
      employee: {
        total: employeeAttendance.length,
        hadir: countByStatus(employeeAttendance, ['Hadir']),
        sakit: countByStatus(employeeAttendance, ['Sakit']),
        izin: countByStatus(employeeAttendance, ['Izin']),
        alpa: countByStatus(employeeAttendance, ['Alpa']),
      },
    };
  }

  async getFinanceReport(month?: string) {
    const [year, m] = month ? month.split('-').map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
    const startDate = new Date(year, m - 1, 1);
    const endDate = new Date(year, m, 0, 23, 59, 59, 999);

    const payments = await this.prisma.payment.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: { fee: true },
    });

    const totalRevenue = payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const byMethod = payments
      .filter(p => p.status === 'success')
      .reduce((acc: Record<string, number>, p) => {
        acc[p.method] = (acc[p.method] || 0) + Number(p.amount);
        return acc;
      }, {});

    return {
      month: `${year}-${String(m).padStart(2, '0')}`,
      total_revenue: totalRevenue,
      total_transactions: payments.length,
      successful: payments.filter(p => p.status === 'success').length,
      pending: payments.filter(p => p.status === 'pending').length,
      failed: payments.filter(p => p.status === 'failed').length,
      by_method: byMethod,
    };
  }

  async getAcademicReport() {
    const [totalSubjects, totalSchedules, totalTeachingLogs, totalExams, gradeDistribution] = await Promise.all([
      this.prisma.subject.count(),
      this.prisma.schedule.count(),
      this.prisma.teachingLog.count(),
      this.prisma.exam.count(),
      this.prisma.finalGrade.findMany({ select: { grade_letter: true } }),
    ]);

    const letterDist: Record<string, number> = {};
    gradeDistribution.forEach(g => {
      const letter = g.grade_letter || 'E';
      letterDist[letter] = (letterDist[letter] || 0) + 1;
    });

    return {
      total_subjects: totalSubjects,
      total_schedules: totalSchedules,
      total_teaching_logs: totalTeachingLogs,
      total_exams: totalExams,
      grade_distribution: letterDist,
    };
  }
}
