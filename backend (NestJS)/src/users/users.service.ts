import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        student: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            profile_picture: true,
            gender: true,
            birth_place: true,
            birth_date: true,
            address: true,
          },
        },
        employee: {
          select: {
            id: true,
            full_name: true,
            education: true,
            position: true,
            join_date: true,
            status: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: {
    username?: string;
    email?: string;
    phone?: string;
    profile_picture?: string;
    student?: {
      full_name?: string;
      gender?: string;
      birth_place?: string;
      birth_date?: string;
      address?: string;
      email?: string;
      phone?: string;
    };
    employee?: {
      full_name?: string;
      education?: string;
      position?: string;
    };
  }) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId }});
      if (!user) throw new NotFoundException('User not found');

      const updateData: any = {};

      if (data.username && data.username !== user.username) {
        const existing = await this.prisma.user.findUnique({ where: { username: data.username }});
        if (existing) throw new BadRequestException('Username sudah digunakan');
        updateData.username = data.username;
      }

      // Update student data if exists
      if (data.student && user.student_id) {
        const studentData: any = {};
        // Only include non-empty strings
        Object.entries(data.student).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            studentData[key] = value;
          }
        });

        if (studentData.email) {
          const existingStudent = await this.prisma.student.findFirst({
            where: { 
              email: studentData.email,
              id: { not: user.student_id }
            }
          });
          if (existingStudent) throw new BadRequestException('Email sudah digunakan oleh siswa lain');
        }

        if (studentData.birth_date) {
          const date = new Date(studentData.birth_date);
          if (isNaN(date.getTime())) {
            delete studentData.birth_date;
          } else {
            studentData.birth_date = date;
          }
        }
        
        if (Object.keys(studentData).length > 0) {
          await this.prisma.student.update({
            where: { id: user.student_id },
            data: studentData,
          });
        }
      }

      // Update employee data if exists
      if (data.employee && user.employee_id) {
        const employeeData: any = {};
        Object.entries(data.employee).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            employeeData[key] = value;
          }
        });

        if (Object.keys(employeeData).length > 0) {
          await this.prisma.employee.update({
            where: { id: user.employee_id },
            data: employeeData,
          });
        }
      }

      // Update user table if needed
      if (Object.keys(updateData).length > 0) {
        await this.prisma.user.update({
          where: { id: userId },
          data: updateData,
        });
      }

      // Fetch fresh data with all relations to return to client
      const updatedUser = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: true,
          student: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
              profile_picture: true,
              gender: true,
              birth_place: true,
              birth_date: true,
              address: true,
            },
          },
          employee: {
            select: {
              id: true,
              full_name: true,
              education: true,
              position: true,
              join_date: true,
              status: true,
            },
          },
        },
      });

      return updatedUser || user;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Gagal memperbarui profil: ' + error.message);
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) throw new NotFoundException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashedPassword },
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: string;
  }) {
    const { page = 1, limit = 10, search, roleId } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search } },
        { student: { full_name: { contains: search } } },
        { employee: { full_name: { contains: search } } },
      ];
    }

    if (roleId) {
      where.role_id = roleId;
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          role: true,
          student: {
            select: { full_name: true, email: true }
          },
          employee: {
            select: { full_name: true }
          }
        },
        orderBy: { username: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: { 
        role: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        student: true,
        employee: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: { username: string; password_hash: string; role_id: string; student_id?: string; employee_id?: string }) {
    const hashedPassword = await bcrypt.hash(data.password_hash, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password_hash: hashedPassword,
      },
    });
  }

  async update(id: string, data: { username?: string; password?: string; role_id?: string }) {
    const updateData: any = { ...data };
    
    if (data.password) {
      updateData.password_hash = await bcrypt.hash(data.password, 10);
      delete updateData.password;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getDevices(userId: string) {
    return this.prisma.userDevice.findMany({
      where: { user_id: userId },
    });
  }

  async toggleDeviceStatus(userId: string, deviceId: string, isActive: boolean) {
    const device = await this.prisma.userDevice.findFirst({
      where: { user_id: userId, id: deviceId },
    });
    
    if (!device) throw new NotFoundException('Device not found for this user');

    return this.prisma.userDevice.update({
      where: { id: deviceId },
      data: { is_active: isActive },
    });
  }
}
