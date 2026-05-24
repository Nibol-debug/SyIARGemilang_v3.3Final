import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentBehaviorService {
  constructor(private prisma: PrismaService) {}

  async findEmployeeByUserId(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { employee_id: true }
    });
    return user?.employee_id || null;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    studentId?: string;
    assessorId?: string;
    classId?: string;
    majorId?: string;
    batchId?: string;
  }) {
    const { page = 1, limit = 10, studentId, assessorId, classId, majorId, batchId } = params;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (studentId) where.student_id = studentId;
    if (assessorId) where.assessor_id = assessorId;

    // Filter by student's class, major, or batch
    if (classId || majorId || batchId) {
      where.student = {};
      if (classId) where.student.class_id = classId;
      if (majorId) where.student.major_id = majorId;
      if (batchId) where.student.batch_id = batchId;
    }

    const [items, total] = await Promise.all([
      this.prisma.studentBehaviorAssessment.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          student: {
            select: {
              id: true,
              full_name: true,
              nis: true,
              status: true,
              class: {
                select: {
                  id: true,
                  name: true,
                  major: { select: { id: true, name: true } },
                  batch: { select: { id: true, name: true } },
                }
              }
            }
          },
          assessor: { select: { id: true, full_name: true, position: true } }
        },
        orderBy: { date: 'desc' }
      }),
      this.prisma.studentBehaviorAssessment.count({ where })
    ]);

    return {
      data: items,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  }

  async findOne(id: string) {
    const assessment = await this.prisma.studentBehaviorAssessment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            full_name: true,
            nis: true,
            status: true,
            class: {
              select: {
                id: true,
                name: true,
                major: { select: { id: true, name: true } },
                batch: { select: { id: true, name: true } },
              }
            }
          }
        },
        assessor: { select: { id: true, full_name: true, position: true } }
      }
    });

    if (!assessment) throw new NotFoundException('Assessment not found');
    return assessment;
  }

  async findByStudentId(studentId: string) {
    const assessments = await this.prisma.studentBehaviorAssessment.findMany({
      where: { student_id: studentId },
      include: {
        student: {
          select: {
            id: true,
            full_name: true,
            nis: true,
            status: true,
            class: {
              select: {
                id: true,
                name: true,
                major: { select: { id: true, name: true } },
                batch: { select: { id: true, name: true } },
              }
            }
          }
        },
        assessor: { select: { id: true, full_name: true, position: true } }
      },
      orderBy: { date: 'desc' }
    });

    return assessments;
  }

  async getSummary(params?: { classId?: string; majorId?: string; batchId?: string }) {
    const { classId, majorId, batchId } = params || {};

    const where: any = {};
    if (classId || majorId || batchId) {
      where.student = {};
      if (classId) where.student.class_id = classId;
      if (majorId) where.student.major_id = majorId;
      if (batchId) where.student.batch_id = batchId;
    }

    const assessments = await this.prisma.studentBehaviorAssessment.findMany({
      where,
      select: {
        attitude: true,
        ethics: true,
        manners: true,
        overallScore: true,
        student_id: true,
        student: {
          select: {
            id: true,
            full_name: true,
            nis: true,
            class: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (assessments.length === 0) {
      return {
        totalAssessments: 0,
        averageAttitude: 0,
        averageEthics: 0,
        averageManners: 0,
        averageOverall: 0,
        predicateDistribution: { A: 0, B: 0, C: 0, D: 0 },
        byClass: [],
        byStudent: []
      };
    }

    const totalAttitude = assessments.reduce((sum, a) => sum + Number(a.attitude), 0);
    const totalEthics = assessments.reduce((sum, a) => sum + Number(a.ethics), 0);
    const totalManners = assessments.reduce((sum, a) => sum + Number(a.manners), 0);
    const totalOverall = assessments.reduce((sum, a) => sum + Number(a.overallScore), 0);
    const count = assessments.length;

    const predicateDistribution = { A: 0, B: 0, C: 0, D: 0 };
    assessments.forEach(a => {
      const score = Number(a.overallScore);
      if (score >= 90) predicateDistribution.A++;
      else if (score >= 80) predicateDistribution.B++;
      else if (score >= 70) predicateDistribution.C++;
      else predicateDistribution.D++;
    });

    // Aggregate by class
    const classMap = new Map<string, { name: string; scores: number[]; count: number }>();
    assessments.forEach(a => {
      const classId = a.student?.class?.id || 'unknown';
      const className = a.student?.class?.name || 'Unknown';
      if (!classMap.has(classId)) {
        classMap.set(classId, { name: className, scores: [], count: 0 });
      }
      const entry = classMap.get(classId)!;
      entry.scores.push(Number(a.overallScore));
      entry.count++;
    });

    const byClass = Array.from(classMap.entries()).map(([id, data]) => ({
      class_id: id,
      class_name: data.name,
      average_score: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      assessment_count: data.count
    }));

    // Aggregate by student
    const studentMap = new Map<string, { name: string; nis: string; scores: number[] }>();
    assessments.forEach(a => {
      const sid = a.student_id;
      if (!studentMap.has(sid)) {
        studentMap.set(sid, {
          name: a.student?.full_name || 'Unknown',
          nis: a.student?.nis || '',
          scores: []
        });
      }
      studentMap.get(sid)!.scores.push(Number(a.overallScore));
    });

    const byStudent = Array.from(studentMap.entries()).map(([id, data]) => ({
      student_id: id,
      full_name: data.name,
      nis: data.nis,
      average_score: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      assessment_count: data.scores.length
    }));

    return {
      totalAssessments: count,
      averageAttitude: totalAttitude / count,
      averageEthics: totalEthics / count,
      averageManners: totalManners / count,
      averageOverall: totalOverall / count,
      predicateDistribution,
      byClass,
      byStudent
    };
  }

  async create(data: any, assessorId: string) {
    // Verify student exists
    const student = await this.prisma.student.findUnique({
      where: { id: data.student_id }
    });
    if (!student) {
      throw new BadRequestException('Siswa tidak ditemukan');
    }

    // Check for duplicate assessment by this assessor
    const existing = await this.prisma.studentBehaviorAssessment.findFirst({
      where: {
        student_id: data.student_id,
        assessor_id: assessorId,
      }
    });
    if (existing) {
      throw new BadRequestException('Anda sudah memberikan penilaian perilaku untuk siswa ini.');
    }

    const overallScore = (Number(data.attitude) + Number(data.ethics) + Number(data.manners)) / 3;
    return this.prisma.studentBehaviorAssessment.create({
      data: {
        student_id: data.student_id,
        assessor_id: assessorId,
        date: data.date ? new Date(data.date) : new Date(),
        attitude: Number(data.attitude),
        ethics: Number(data.ethics),
        manners: Number(data.manners),
        overallScore: overallScore,
        notes: data.notes
      },
      include: {
        student: {
          select: {
            id: true,
            full_name: true,
            nis: true,
            class: { select: { id: true, name: true } }
          }
        },
        assessor: { select: { id: true, full_name: true } }
      }
    });
  }

  async update(id: string, data: any) {
    const existing = await this.findOne(id);
    const attitude = data.attitude !== undefined ? Number(data.attitude) : existing.attitude;
    const ethics = data.ethics !== undefined ? Number(data.ethics) : existing.ethics;
    const manners = data.manners !== undefined ? Number(data.manners) : existing.manners;
    const overallScore = (attitude + ethics + manners) / 3;

    const updateData: any = {
      attitude,
      ethics,
      manners,
      overallScore,
      notes: data.notes !== undefined ? data.notes : existing.notes
    };
    
    if (data.date) {
      updateData.date = new Date(data.date);
    }
    if (data.student_id) {
      const student = await this.prisma.student.findUnique({ where: { id: data.student_id } });
      if (!student) throw new BadRequestException('Siswa tidak ditemukan');
      updateData.student_id = data.student_id;
    }

    return this.prisma.studentBehaviorAssessment.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            full_name: true,
            nis: true,
            class: { select: { id: true, name: true } }
          }
        },
        assessor: { select: { id: true, full_name: true } }
      }
    });
  }

  async remove(id: string) {
    return this.prisma.studentBehaviorAssessment.delete({
      where: { id }
    });
  }
}
