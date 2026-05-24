import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import * as QRCode from 'qrcode';

@Injectable()
export class ApplicantsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async create(data: CreateApplicantDto) {
    const applicant = await this.prisma.applicant.create({
      data: {
        ...data,
        birth_date: new Date(data.birth_date),
      },
    });

    // Send notification to users with view_applicants permission
    const usersWithAccess = await this.prisma.user.findMany({
      where: {
        role: {
          permissions: {
            some: {
              permission: {
                name: { in: ['view_applicants', 'manage_applicants'] }
              }
            }
          }
        }
      },
    });

    await Promise.all(
      usersWithAccess.map((user) =>
        this.notificationsService.createForUser(
          user.id,
          'Pendaftar Baru',
          `${applicant.full_name} telah mendaftar sebagai siswa baru.`,
          'ppdb',
          '/ppdb-admin'
        )
      )
    );

    return applicant;
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { full_name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.applicant.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          major: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.applicant.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const applicant = await this.prisma.applicant.findUnique({ 
      where: { id },
      include: {
        major: true,
      }
    });
    if (!applicant) throw new NotFoundException(`Applicant with ID ${id} not found`);
    return applicant;
  }

  async update(id: string, data: any) {
    return this.prisma.applicant.update({
      where: { id },
      data: {
        ...data,
        birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.applicant.delete({ where: { id } });
  }

  async verify(id: string, status: string) {
    return this.update(id, { status });
  }

  async acceptApplicant(id: string) {
    const applicant = await this.prisma.applicant.findUnique({
      where: { id },
      include: { major: true, student: true },
    });

    if (!applicant) throw new NotFoundException('Applicant not found');
    if (applicant.student) throw new Error('Applicant already converted to student');

    const activeBatch = await this.prisma.batch.findFirst({
      where: { is_active: true },
    });

    if (!activeBatch) throw new Error('No active batch found');

    // Create Student record with pending status
    const tempNis = 'REG-PENDING-' + applicant.id.substring(0, 8);
    const qrCodeBase64 = await QRCode.toDataURL(tempNis);

    const student = await this.prisma.student.create({
      data: {
        nik: applicant.nik || 'TEMP-' + applicant.id.substring(0, 8),
        nis: tempNis,
        full_name: applicant.full_name,
        gender: applicant.gender,
        birth_place: applicant.birth_place,
        birth_date: applicant.birth_date,
        address: applicant.address,
        latitude: applicant.latitude,
        longitude: applicant.longitude,
        phone: applicant.phone,
        email: applicant.email,
        status: 'pending_payment',
        major_id: applicant.major_id,
        branch_id: applicant.major.branch_id,
        batch_id: activeBatch.id,
        applicant_id: applicant.id,
        qr_code: qrCodeBase64,
        parents: {
          create: {
            father_name: applicant.father_name || '-',
            mother_name: applicant.mother_name || '-',
            phone: applicant.phone,
            address: applicant.address,
          }
        },
        histories: {
          create: {
            type: 'masuk',
            description: 'Pendaftar diterima, menunggu pembayaran daftar ulang',
            date: new Date(),
          }
        }
      },
    });

    // Find or Create Enrollment Fee
    let fee = await this.prisma.fee.findFirst({
      where: { name: 'Biaya Daftar Ulang' },
    });

    if (!fee) {
      fee = await this.prisma.fee.create({
        data: {
          name: 'Biaya Daftar Ulang',
          amount: 1500000,
          type: 'once',
          description: 'Biaya daftar ulang untuk pendaftar baru',
        },
      });
    }

    // Create Payment Invoice
    await this.prisma.payment.create({
      data: {
        student_id: student.id,
        fee_id: fee.id,
        amount: fee.amount,
        method: 'transfer',
        status: 'pending',
      },
    });

    // Update Applicant Status
    return this.prisma.applicant.update({
      where: { id },
      data: { status: 'accepted' },
    });
  }
}
