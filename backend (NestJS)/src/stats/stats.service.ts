import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalStudents,
      totalEmployees,
      applicantPPDB,
      ongoingExams,
      todayAttendance,
      totalPayments,
      totalFees,
      totalAssets,
      systemUsers,
    ] = await Promise.all([
      this.prisma.student.count({ where: { status: 'active' } }),
      this.prisma.employee.count(),
      this.prisma.applicant.count(),
      this.prisma.examSession.count({ where: { status: 'ongoing' } }),
      this.prisma.attendance.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
          status: 'present',
        },
      }),
      this.prisma.payment.count({ where: { status: 'success' } }),
      this.prisma.fee.count(),
      this.prisma.asset.count(),
      this.prisma.user.count(),
    ]);

    const attendancePercentage = totalStudents > 0 ? (todayAttendance / totalStudents) * 100 : 0;
    const paymentPercentage = totalStudents > 0 ? (totalPayments / totalStudents) * 100 : 0;

    const majors = await this.prisma.major.findMany({
      include: { _count: { select: { students: true } } },
    });

    const majorDistribution = majors.map(m => ({
      name: m.code,
      value: m._count.students,
      color: this.getRandomColor(m.code),
    }));

    return {
      overview: {
        totalStudents,
        totalEmployees,
        applicantPPDB,
        ongoingExams,
        todayAttendance,
        attendancePercentage: Math.round(attendancePercentage),
        totalPayments,
        paymentPercentage: Math.round(paymentPercentage),
        totalAssets,
        systemUsers,
      },
      majorDistribution,
    };
  }

  async getGuruDashboardStats(employeeId: string) {
    const [
      totalClasses,
      ongoingExams,
      upcomingExams,
      recentTeachingLogs,
    ] = await Promise.all([
      this.prisma.class.count({ where: { homeroom_teacher_id: employeeId } }),
      this.prisma.examSession.count({ 
        where: { 
          status: 'ongoing'
        } 
      }),
      this.prisma.examSession.count({ 
        where: { 
          status: 'pending',
          start_time: { gte: new Date() }
        } 
      }),
      this.prisma.teachingLog.findMany({
        where: { teacher_id: employeeId },
        take: 5,
        orderBy: { date: 'desc' },
        include: { class: true, subject: true }
      }),
    ]);

    return {
      totalClasses,
      ongoingExams,
      upcomingExams,
      recentTeachingLogs,
    };
  }

  async getStudentDashboardStats(studentId: string) {
    const [
      ongoingExams,
      attendance,
      recentGrades,
      unpaidFees,
    ] = await Promise.all([
      this.prisma.examSession.count({ 
        where: { status: 'ongoing' } // Simplified for now
      }),
      this.prisma.attendance.count({
        where: { student_id: studentId, status: 'present' }
      }),
      this.prisma.grade.findMany({
        where: { student_id: studentId },
        take: 5,
        orderBy: { created_at: 'desc' },
        include: { subject: true }
      }),
      this.prisma.payment.findMany({
        where: { student_id: studentId, status: 'pending' },
        include: { fee: true }
      }),
    ]);

    return {
      ongoingExams,
      attendanceCount: attendance,
      recentGrades,
      unpaidFees,
    };
  }

  private getRandomColor(seed: string) {
    const colors = ['#1e40af', '#173bab', '#3755c3', '#4f46e5', '#6366f1'];
    const index = seed.length % colors.length;
    return colors[index];
  }

  async getStudentStats() {
    const [total, male, female, active, alumni, moved, students, branches] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.student.count({ where: { gender: 'L' } }),
      this.prisma.student.count({ where: { gender: 'P' } }),
      this.prisma.student.count({ where: { status: 'active' } }),
      this.prisma.student.count({ where: { status: 'alumni' } }),
      this.prisma.student.count({ where: { status: 'moved' } }),
      this.prisma.student.findMany({
        select: {
          birth_date: true,
        }
      }),
      this.prisma.branch.findMany({
        include: { _count: { select: { students: true } } }
      })
    ]);

    // Calculate Age Distribution
    const ageDist: Record<string, number> = {};
    const now = new Date();
    students.forEach(s => {
      const birth = new Date(s.birth_date);
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      const ageLabel = age < 15 ? '< 15' : age > 20 ? '> 20' : `${age} thn`;
      ageDist[ageLabel] = (ageDist[ageLabel] || 0) + 1;
    });

    // Location Distribution from Branch Model
    const locationDistribution = branches.map(b => ({
      name: b.name,
      value: b._count.students
    }));

    return { 
      total, 
      male, 
      female, 
      active, 
      alumni, 
      moved,
      ageDistribution: Object.entries(ageDist).map(([name, value]) => ({ name, value })),
      locationDistribution
    };
  }
  async getEmployeeStats() {
    const [total, teachers, staff, employees] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.employee.count({ where: { OR: [ { position: { contains: 'Guru' } }, { position: { contains: 'Instruktur' } } ] } }),
      this.prisma.employee.count({ where: { NOT: { OR: [ { position: { contains: 'Guru' } }, { position: { contains: 'Instruktur' } } ] } } }),
      this.prisma.employee.findMany({
        select: { education: true, status: true, is_certified: true, certification_status: true }
      }),
    ]);

    // Calculate Education Distribution
    const educationDist: Record<string, number> = {};
    employees.forEach(e => {
      const label = e.education || 'Lainnya';
      educationDist[label] = (educationDist[label] || 0) + 1;
    });

    // Calculate Status Distribution
    const statusDist: Record<string, number> = {};
    employees.forEach(e => {
      const label = e.status || 'unknown';
      statusDist[label] = (statusDist[label] || 0) + 1;
    });

    // Calculate Certification Distribution
    const certifiedCount = employees.filter(e => e.is_certified).length;
    const certificationDist: Record<string, number> = {
      'Sudah Sertifikasi': certifiedCount,
      'Belum Sertifikasi': total - certifiedCount
    };

    return { 
      total, 
      teachers, 
      staff,
      certifiedCount,
      educationDistribution: Object.entries(educationDist).map(([name, value]) => ({ name, value })),
      statusDistribution: Object.entries(statusDist).map(([name, value]) => ({ name, value })),
      certificationDistribution: Object.entries(certificationDist).map(([name, value]) => ({ name, value }))
    };
  }

  async getGradingStats() {
    const [totalGrades, finalGrades] = await Promise.all([
      this.prisma.grade.count(),
      this.prisma.finalGrade.findMany({
        select: { final_score: true, is_passed: true }
      })
    ]);

    const totalFinalized = finalGrades.length;
    const passedCount = finalGrades.filter(g => g.is_passed).length;
    const remedialCount = totalFinalized - passedCount;
    
    const averageScore = totalFinalized > 0
      ? finalGrades.reduce((acc, g) => acc + Number(g.final_score), 0) / totalFinalized
      : 0;
    
    const passPercentage = totalFinalized > 0
      ? (passedCount / totalFinalized) * 100
      : 0;

    return {
      totalGrades,
      averageScore: Math.round(averageScore * 10) / 10,
      passedCount,
      remedialCount,
      passPercentage: Math.round(passPercentage),
    };
  }
}
