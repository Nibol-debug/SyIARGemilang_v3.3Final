import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartExamDto, SubmitAnswerDto, LogViolationDto } from './dto/exam-session.dto';

@Injectable()
export class ExamSessionsService {
  constructor(private prisma: PrismaService) {}

  async startExam(params: { studentId?: string; applicantId?: string; examId: string }, data: StartExamDto) {
    const { studentId, applicantId, examId } = params;
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true }
    });

    if (!exam) throw new NotFoundException('Exam not found');

    // 1. Check Token
    if (exam.token !== data.token) {
      throw new BadRequestException('Invalid exam token');
    }

    // 2. Check Entity and Major
    let userId: string | undefined;
    if (studentId) {
      const student = await this.prisma.student.findUnique({
        where: { id: studentId },
        include: { user: true }
      });
      if (!student) throw new NotFoundException('Student not found');
      if (student.major_id !== exam.major_id) {
        throw new ForbiddenException('You are not allowed to take this exam (Major mismatch)');
      }
      userId = student.user?.id;
    } else if (applicantId) {
      const applicant = await this.prisma.applicant.findUnique({ where: { id: applicantId } });
      if (!applicant) throw new NotFoundException('Applicant not found');
      if (applicant.major_id !== exam.major_id) {
        throw new ForbiddenException('You are not allowed to take this exam (Major mismatch)');
      }
      if (applicant.status !== 'verified') {
        throw new ForbiddenException('Pendaftaran Anda belum diverifikasi untuk mengikuti ujian.');
      }
    } else {
      throw new BadRequestException('Missing student_id or applicant_id');
    }

    // 3. Check Time
    const now = new Date();
    if (now < exam.start_time || now > exam.end_time) {
      throw new BadRequestException('Exam is not currently active');
    }

    // 4. Implement Device Locking (Only for students with users)
    if (userId && data.device_id) {
      const activeDevices = await this.prisma.userDevice.findMany({
        where: { user_id: userId, is_active: true }
      });

      if (activeDevices.length > 0) {
        const isDeviceAllowed = activeDevices.some(d => d.device_id === data.device_id);
        if (!isDeviceAllowed) {
          throw new ForbiddenException('Akun Anda terkunci pada perangkat lain. Silakan hubungi Administrator untuk mereset perangkat.');
        }
      } else {
        await this.prisma.userDevice.create({
          data: {
            user_id: userId,
            device_id: data.device_id,
            is_active: true
          }
        });
      }
    }

    // 5. Check Existing Session
    const existing = await this.prisma.examSession.findFirst({
      where: { 
        OR: [
          { student_id: studentId, exam_id: examId },
          { applicant_id: applicantId, exam_id: examId }
        ]
      },
      include: { answers: true, logs: true }
    });
    
    if (existing) {
      if (existing.status === 'submitted') throw new BadRequestException('You have already submitted this exam');
      if (existing.status === 'blocked') throw new ForbiddenException('Sesi ujian Anda telah diblokir karena pelanggaran.');
      return existing; // Resume
    }

    return this.prisma.examSession.create({
      data: {
        exam_id: examId,
        student_id: studentId,
        applicant_id: applicantId,
        status: 'ongoing',
        device_id: data.device_id,
        warning_count: 0,
      }
    });
  }

  async submitAnswer(sessionId: string, data: SubmitAnswerDto) {
    const session = await this.prisma.examSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'ongoing') throw new BadRequestException('Session is not active');

    const existing = await this.prisma.studentAnswer.findFirst({
      where: { session_id: sessionId, question_id: data.question_id }
    });

    if (existing) {
      return this.prisma.studentAnswer.update({
        where: { id: existing.id },
        data: { answer: data.answer },
      });
    }

    return this.prisma.studentAnswer.create({
      data: {
        session_id: sessionId,
        question_id: data.question_id,
        answer: data.answer,
      }
    });
  }

  async logViolation(sessionId: string, data: LogViolationDto) {
    const session = await this.prisma.examSession.findUnique({ where: { id: sessionId } });
    if (!session || session.status !== 'ongoing') return { ignored: true };

    const log = await this.prisma.examLog.create({
      data: {
        session_id: sessionId,
        type: data.type,
        description: data.description || null,
      }
    });

    // Increment warning count
    const updatedSession = await this.prisma.examSession.update({
      where: { id: sessionId },
      data: { warning_count: { increment: 1 } }
    });

    // Check violation count for auto-submit safety (3x limit)
    if (updatedSession.warning_count >= 3) {
      if (updatedSession.status === 'ongoing') {
        await this.finalizeExam(sessionId, true);
        return { ...log, auto_submitted: true, reason: 'Batas pelanggaran tercapai (3x)' };
      }
    }

    return { ...log, warning_count: updatedSession.warning_count };
  }

  async getSessionDetail(sessionId: string) {
    const session = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        student: { select: { full_name: true, nis: true } },
        applicant: { select: { full_name: true } },
        exam: { select: { title: true, duration: true } },
        answers: { include: { question: { select: { question_text: true, type: true } } } },
        logs: { orderBy: { timestamp: 'desc' } }
      }
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async forceSubmit(sessionId: string) {
    return this.finalizeExam(sessionId, true);
  }

  async finalizeExam(sessionId: string, isForced = false) {
    const session = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        exam: {
          include: {
            questions: { include: { options: true } }
          }
        },
        answers: true
      }
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.status === 'submitted') throw new BadRequestException('Exam already submitted');

    // AUTO GRADING MCQ
    let score = 0;
    let totalMcq = 0;

    session.exam.questions.forEach((q) => {
      if (q.type === 'mcq') {
        totalMcq++;
        const studentAnswer = session.answers.find((a) => a.question_id === q.id);
        const correctOption = q.options.find((o) => o.is_correct);
        
        if (studentAnswer && correctOption && studentAnswer.answer === correctOption.option_text) {
          score++;
        }
      }
    });

    const totalQuestions = session.exam.questions.length;
    const finalScore = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    // Update Session Status
    await this.prisma.examSession.update({
      where: { id: sessionId },
      data: { 
        status: isForced ? 'blocked' : 'submitted', 
        end_time: new Date() 
      }
    });

    // Log forced submission
    if (isForced) {
      await this.prisma.examLog.create({
        data: {
          session_id: sessionId,
          type: 'auto_submit',
          description: 'Ujian dikumpulkan otomatis karena pelanggaran atau force submit admin.'
        }
      });
    }

    // PUSH TO GRADES TABLE
    let batchId: string;
    if (session.student_id) {
      const student = await this.prisma.student.findUnique({ where: { id: session.student_id } });
      if (!student) throw new NotFoundException('Student not found');
      batchId = student.batch_id;
    } else {
      const activeBatch = await this.prisma.batch.findFirst({ where: { is_active: true } });
      if (!activeBatch) throw new Error('No active batch found');
      batchId = activeBatch.id;
    }

    await this.prisma.grade.create({
      data: {
        student_id: session.student_id,
        applicant_id: session.applicant_id,
        subject_id: session.exam.subject_id,
        exam_id: session.exam.id,
        type: session.exam.type,
        score: finalScore,
        weight: 1.0,
        major_id: session.exam.major_id,
        batch_id: batchId,
      }
    });

    return { score: finalScore, total_correct: score, total_questions: totalMcq, forced: isForced };
  }
}
