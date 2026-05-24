import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRemedialDto, ScheduleRemedialDto, UpdateRemedialScoreDto, FindAllRemedialDto } from './dto/remedial.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RemedialService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get daftar siswa yang perlu remedial untuk mata pelajaran tertentu
   */
  async getStudentsNeedingRemedial(subjectId?: string, classId?: string, semester?: number) {
    const where: any = {
      is_passed: false,
    };

    if (subjectId) {
      where.subject_id = subjectId;
    }

    if (semester) {
      where.semester = semester;
    }

    if (classId) {
      where.student = { class_id: classId };
    }

    const finalGrades = await this.prisma.finalGrade.findMany({
      where,
      include: {
        student: {
          include: {
            class: true,
            batch: true
          }
        },
        subject: true
      }
    });

    let filtered = finalGrades;

    // Get existing remedial records
    const studentIds = filtered.map(g => g.student_id);
    const existingRemedials = await this.prisma.remedial.findMany({
      where: {
        student_id: { in: studentIds },
        subject_id: subjectId || undefined,
        semester: semester || undefined,
      },
      orderBy: { created_at: 'desc' }
    });

    return filtered.map(grade => {
      const existingRemedial = existingRemedials.find(
        r => r.student_id === grade.student_id && r.subject_id === grade.subject_id
      );
      return {
        id: grade.id,
        final_grade_id: grade.id,
        student_id: grade.student_id,
        nis: grade.student.nis,
        full_name: grade.student.full_name,
        class_name: grade.student.class?.name || '-',
        semester: grade.semester,
        final_score: Number(grade.final_score),
        grade_letter: grade.grade_letter,
        needs_remedial: !grade.is_passed,
        remedial_status: existingRemedial?.status || 'pending',
        remedial_id: existingRemedial?.id,
        score_after: existingRemedial?.score_after ? Number(existingRemedial.score_after) : null,
        scheduled_at: existingRemedial?.scheduled_at,
      };
    });
  }

  /**
   * Create remedial record untuk siswa
   */
  async create(data: CreateRemedialDto) {
    // Verify student exists
    const student = await this.prisma.student.findUnique({
      where: { id: data.student_id }
    });
    if (!student) throw new NotFoundException('Student not found');

    // Verify subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id: data.subject_id }
    });
    if (!subject) throw new NotFoundException('Subject not found');

    // Check if exam exists if provided
    if (data.exam_id) {
      const exam = await this.prisma.exam.findUnique({
        where: { id: data.exam_id }
      });
      if (!exam) throw new NotFoundException('Exam not found');
    }

    // Check if there's already an active remedial for same student/subject/semester
    const existing = await this.prisma.remedial.findFirst({
      where: {
        student_id: data.student_id,
        subject_id: data.subject_id,
        semester: data.semester || 1,
        status: { in: ['pending', 'scheduled'] }
      }
    });

    if (existing) {
      throw new BadRequestException('Student already has an active remedial for this subject this semester');
    }

    // Get score_before from final grade if not provided
    let scoreBefore = data.score_before;
    const sem = data.semester || 1;
    if (scoreBefore === undefined || scoreBefore === null) {
      const finalGrade = await this.prisma.finalGrade.findFirst({
        where: {
          student_id: data.student_id,
          subject_id: data.subject_id,
          semester: sem,
        },
        orderBy: { semester: 'desc' }
      });
      scoreBefore = finalGrade ? Number(finalGrade.final_score) : 0;
    }

    // Get batch_id from student if not provided
    let batchId = data.batch_id;
    if (!batchId) {
      const student = await this.prisma.student.findUnique({
        where: { id: data.student_id },
        select: { batch_id: true }
      });
      batchId = student?.batch_id || undefined;
    }

    return this.prisma.remedial.create({
      data: {
        student_id: data.student_id,
        subject_id: data.subject_id,
        batch_id: batchId,
        semester: sem,
        exam_id: data.exam_id,
        status: data.scheduled_at ? 'scheduled' : 'pending',
        score_before: new Prisma.Decimal(scoreBefore),
        scheduled_at: data.scheduled_at ? new Date(data.scheduled_at) : null,
        notes: data.notes,
      },
      include: {
        student: { select: { id: true, full_name: true, nis: true } },
        subject: true,
        exam: true
      }
    });
  }

  /**
   * Schedule remedial exam
   */
  async schedule(remedialId: string, data: ScheduleRemedialDto) {
    const remedial = await this.prisma.remedial.findUnique({
      where: { id: remedialId }
    });

    if (!remedial) throw new NotFoundException('Remedial record not found');

    // Verify exam exists
    const exam = await this.prisma.exam.findUnique({
      where: { id: data.exam_id }
    });

    if (!exam) throw new NotFoundException('Exam not found');

    return this.prisma.remedial.update({
      where: { id: remedialId },
      data: {
        exam_id: data.exam_id,
        scheduled_at: new Date(data.scheduled_at),
        status: 'scheduled',
      },
      include: {
        student: true,
        subject: true,
        exam: true
      }
    });
  }

  /**
   * Update nilai setelah remedial
   */
  async updateScore(remedialId: string, data: UpdateRemedialScoreDto) {
    const remedial = await this.prisma.remedial.findUnique({
      where: { id: remedialId }
    });

    if (!remedial) throw new NotFoundException('Remedial record not found');

    const updated = await this.prisma.remedial.update({
      where: { id: remedialId },
      data: {
        score_after: new Prisma.Decimal(data.score_after),
        status: 'completed',
        completed_at: new Date(),
        notes: data.notes ? `${remedial.notes || ''}\n${data.notes}`.trim() : remedial.notes,
      },
      include: {
        student: true,
        subject: true
      }
    });

    // Update final grade if score improved
    if (data.score_after > Number(remedial.score_before)) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: remedial.subject_id }
      });
      const passingGrade = subject ? Number(subject.passing_grade) : 75;
      await this.prisma.finalGrade.updateMany({
        where: {
          student_id: remedial.student_id,
          subject_id: remedial.subject_id,
        },
        data: {
          is_passed: data.score_after >= passingGrade,
          grade_letter: this.calculateGradeLetter(data.score_after),
        }
      });
    }

    return updated;
  }

  /**
   * Get all remedial records with filters
   */
  async findAll(filters: FindAllRemedialDto) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.subject_id) where.subject_id = filters.subject_id;
    if (filters.student_id) where.student_id = filters.student_id;
    if (filters.semester) where.semester = filters.semester;

    return this.prisma.remedial.findMany({
      where,
      include: {
        student: {
          select: { id: true, full_name: true, nis: true, class: { select: { name: true } } }
        },
        subject: true,
        exam: true
      },
      orderBy: { created_at: 'desc' }
    });
  }

  /**
   * Get remedial by ID
   */
  async findOne(id: string) {
    const remedial = await this.prisma.remedial.findUnique({
      where: { id },
      include: {
        student: {
          select: { id: true, full_name: true, nis: true, class: true, batch: true }
        },
        subject: true,
        exam: true
      }
    });

    if (!remedial) throw new NotFoundException('Remedial record not found');
    return remedial;
  }

  /**
   * Delete remedial record
   */
  async remove(id: string) {
    const remedial = await this.prisma.remedial.findUnique({
      where: { id }
    });

    if (!remedial) throw new NotFoundException('Remedial record not found');

    return this.prisma.remedial.delete({
      where: { id }
    });
  }

  /**
   * Get remedial statistics
   */
  async getStats() {
    const [total, pending, scheduled, completed] = await Promise.all([
      this.prisma.remedial.count(),
      this.prisma.remedial.count({ where: { status: 'pending' } }),
      this.prisma.remedial.count({ where: { status: 'scheduled' } }),
      this.prisma.remedial.count({ where: { status: 'completed' } }),
    ]);

    // Calculate success rate
    const completedRemedials = await this.prisma.remedial.findMany({
      where: { status: 'completed' },
      include: { subject: { select: { passing_grade: true } } }
    });

    const improvedCount = completedRemedials.filter(r => 
      r.score_after && Number(r.score_after) > Number(r.score_before)
    ).length;

    const passCount = completedRemedials.filter(r => 
      r.score_after && Number(r.score_after) >= Number(r.subject.passing_grade)
    ).length;

    return {
      total,
      pending,
      scheduled,
      completed,
      improved_count: improvedCount,
      pass_count: passCount,
      improvement_rate: completed > 0 
        ? Math.round((improvedCount / completed) * 100) 
        : 0,
      pass_rate: completed > 0 
        ? Math.round((passCount / completed) * 100) 
        : 0,
    };
  }

  private calculateGradeLetter(score: number): string {
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 65) return 'C';
    if (score >= 50) return 'D';
    return 'E';
  }
}
