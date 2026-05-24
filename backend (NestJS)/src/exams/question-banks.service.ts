import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class QuestionBanksService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.questionBank.create({
      data: {
        title: data.title,
        subject_id: data.subject_id,
        major_id: data.major_id,
        type: data.type,
        question_text: data.question_text,
        difficulty: data.difficulty,
        options: data.type === 'mcq' ? {
          create: data.options.map(o => ({
            option_text: o.option_text,
            is_correct: o.is_correct
          }))
        } : undefined
      },
      include: {
        options: true,
        subject: true,
        major: true
      }
    });
  }

  async createBulk(data: any[]) {
    return this.prisma.$transaction(
      data.map((item) =>
        this.prisma.questionBank.create({
          data: {
            title: item.title || item.question_text.substring(0, 50),
            subject_id: item.subject_id,
            major_id: item.major_id,
            type: item.type,
            question_text: item.question_text,
            difficulty: item.difficulty || 'easy',
            options: item.type === 'mcq' ? {
              create: item.options.map((o: any) => ({
                option_text: o.option_text,
                is_correct: o.is_correct
              }))
            } : undefined
          }
        })
      )
    );
  }

  async findAll(pagination: PaginationDto, filters?: any) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.subject_id) where.subject_id = filters.subject_id;
    if (filters?.major_id) where.major_id = filters.major_id;
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { question_text: { contains: filters.search } }
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.questionBank.findMany({
        where,
        skip,
        take: limit,
        include: {
          options: true,
          subject: true,
          major: true
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.questionBank.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const qb = await this.prisma.questionBank.findUnique({
      where: { id },
      include: {
        options: true,
        subject: true,
        major: true
      }
    });
    if (!qb) throw new NotFoundException('Question Bank not found');
    return qb;
  }

  async update(id: string, data: any) {
    if (data.options && data.type === 'mcq') {
      await this.prisma.questionBankOption.deleteMany({
        where: { question_bank_id: id }
      });
      data.options = {
        create: data.options.map(o => ({
          option_text: o.option_text,
          is_correct: o.is_correct
        }))
      };
    } else if (data.type === 'essay') {
      await this.prisma.questionBankOption.deleteMany({
        where: { question_bank_id: id }
      });
    }

    return this.prisma.questionBank.update({
      where: { id },
      data,
      include: { options: true }
    });
  }

  async remove(id: string) {
    return this.prisma.questionBank.delete({ where: { id } });
  }

  async importToExam(examId: string, questionBankIds: string[]) {
    // Fetch all questions from the banks
    const banks = await this.prisma.questionBank.findMany({
      where: { id: { in: questionBankIds } },
      include: { options: true }
    });

    // Create questions for the exam
    const createdQuestions: any[] = [];
    for (const bank of banks) {
      const q = await this.prisma.question.create({
        data: {
          exam_id: examId,
          type: bank.type,
          question_text: bank.question_text,
          difficulty: bank.difficulty,
          options: bank.type === 'mcq' ? {
            create: bank.options.map(o => ({
              option_text: o.option_text,
              is_correct: o.is_correct
            }))
          } : undefined
        }
      });
      createdQuestions.push(q);
    }
    return createdQuestions;
  }
}
