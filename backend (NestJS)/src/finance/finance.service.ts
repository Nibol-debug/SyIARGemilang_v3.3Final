import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { StudentsService } from '../students/students.service';

@Injectable()
export class FinanceService {
  constructor(
    private prisma: PrismaService,
    private studentsService: StudentsService,
    private notificationsService: NotificationsService
  ) {}

  // Fees
  async createFee(createFeeDto: CreateFeeDto) {
    return this.prisma.fee.create({
      data: createFeeDto,
    });
  }

  async findAllFees(pagination: PaginationDto, filters: { search?: string; type?: string }) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.search) {
      where.name = { contains: filters.search };
    }
    if (filters.type) {
      where.type = filters.type;
    }

    const [data, total] = await Promise.all([
      this.prisma.fee.findMany({
        where,
        skip,
        take: limit,
      }),
      this.prisma.fee.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOneFee(id: string) {
    const fee = await this.prisma.fee.findUnique({
      where: { id },
    });
    if (!fee) throw new NotFoundException(`Fee with ID ${id} not found`);
    return fee;
  }

  async updateFee(id: string, updateFeeDto: UpdateFeeDto) {
    return this.prisma.fee.update({
      where: { id },
      data: updateFeeDto,
    });
  }

  async removeFee(id: string) {
    const paymentCount = await this.prisma.payment.count({
      where: { fee_id: id },
    });
    if (paymentCount > 0) {
      throw new ConflictException(`Fee memiliki ${paymentCount} pembayaran terkait. Hapus pembayaran terlebih dahulu.`);
    }
    return this.prisma.fee.delete({
      where: { id },
    });
  }

  // Payments
  async createPayment(createPaymentDto: CreatePaymentDto) {
    const paymentDate = createPaymentDto.date ? new Date(createPaymentDto.date) : new Date();
    paymentDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(paymentDate);
    nextDay.setDate(paymentDate.getDate() + 1);

    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        student_id: createPaymentDto.student_id,
        fee_id: createPaymentDto.fee_id,
        date: {
          gte: paymentDate,
          lt: nextDay,
        },
      },
    });

    if (existingPayment) {
      throw new Error('Pembayaran untuk siswa dan jenis biaya ini pada tanggal yang sama sudah ada.');
    }

    const payment = await this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        date: paymentDate,
      },
      include: {
        student: true,
        fee: true,
      },
    });

    try {
      const user = await this.prisma.user.findFirst({
        where: { student_id: payment.student_id },
      });

      if (user) {
        await this.notificationsService.createForUser(
          user.id,
          'Pembayaran Baru',
          `Pembayaran ${payment.fee.name} sebesar Rp ${Number(payment.amount).toLocaleString()} telah dicatatkan.`,
          'payment',
          '/finance'
        );
      }
    } catch (err) {
      console.error('Failed to create notification for payment:', err);
    }

    return payment;
  }

  async findAllPayments(pagination: PaginationDto, filters: { search?: string; status?: string; student_id?: string }) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.search) {
      where.student = {
        full_name: { contains: filters.search }
      };
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.student_id) {
      where.student_id = filters.student_id;
    }

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: true,
          fee: true,
        },
        orderBy: {
          date: 'desc'
        }
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOnePayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        student: true,
        fee: true,
      },
    });
    if (!payment) throw new NotFoundException(`Payment with ID ${id} not found`);
    return payment;
  }

  async updatePayment(id: string, updatePaymentDto: UpdatePaymentDto) {
    const data: any = { ...updatePaymentDto };
    if (updatePaymentDto.date) {
      data.date = new Date(updatePaymentDto.date);
    }

    const currentPayment = await this.prisma.payment.findUnique({
      where: { id },
      include: { student: true, fee: true },
    });

    if (!currentPayment) throw new NotFoundException(`Payment with ID ${id} not found`);

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data,
      include: {
        student: true,
        fee: true,
      },
    });

    // Send notification if status changed to success
    try {
      if (currentPayment.status !== 'success' && updatedPayment.status === 'success') {
        const user = await this.prisma.user.findFirst({
          where: { student_id: updatedPayment.student_id },
        });

        if (user) {
          await this.notificationsService.createForUser(
            user.id,
            'Pembayaran Berhasil',
            `Pembayaran ${updatedPayment.fee.name} sebesar Rp ${Number(updatedPayment.amount).toLocaleString()} telah berhasil dikonfirmasi.`,
            'payment',
            '/finance'
          );
        }
      }
    } catch (err) {
      console.error('Failed to create notification for payment status change:', err);
    }

    // PPDB Integration: If payment is success and it's for Enrollment Fee
    if (updatedPayment.status === 'success' && updatedPayment.fee.name === 'Biaya Daftar Ulang') {
      await this.studentsService.finalizeRegistration(updatedPayment.student_id);
    }

    return updatedPayment;
  }

  async removePayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });
    if (!payment) throw new NotFoundException(`Payment with ID ${id} not found`);
    return this.prisma.payment.delete({
      where: { id },
    });
  }

  async sendPaymentReminders() {
    const pendingPayments = await this.prisma.payment.findMany({
      where: { status: 'pending' },
      include: { student: true, fee: true },
    });

    let notified = 0;
    for (const payment of pendingPayments) {
      const user = await this.prisma.user.findFirst({
        where: { student_id: payment.student_id },
      });
      if (user) {
        await this.notificationsService.createForUser(
          user.id,
          'Pengingat Pembayaran',
          `Pembayaran ${payment.fee.name} sebesar Rp ${Number(payment.amount).toLocaleString()} masih tertunggak. Segera lunasi.`,
          'payment',
          '/finance'
        );
        notified++;
      }
    }

    return { notified, total_pending: pendingPayments.length };
  }
}
