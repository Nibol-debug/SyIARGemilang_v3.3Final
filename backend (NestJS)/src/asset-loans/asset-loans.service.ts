import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetLoanDto } from './dto/create-asset-loan.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class AssetLoansService {
  constructor(private prisma: PrismaService) {}

  async create(createAssetLoanDto: CreateAssetLoanDto) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: createAssetLoanDto.asset_id },
    });

    if (!asset) throw new NotFoundException(`Asset with ID ${createAssetLoanDto.asset_id} not found`);
    if (asset.status === 'loaned') {
      throw new BadRequestException('Asset is currently loaned');
    }

    const loan = await this.prisma.assetLoan.create({
      data: {
        asset_id: createAssetLoanDto.asset_id,
        employee_id: createAssetLoanDto.employee_id,
        loan_date: createAssetLoanDto.loan_date ? new Date(createAssetLoanDto.loan_date) : new Date(),
        expected_return_date: createAssetLoanDto.expected_return_date
          ? new Date(createAssetLoanDto.expected_return_date)
          : null,
        notes: createAssetLoanDto.notes,
      },
      include: {
        asset: true,
        employee: true,
      },
    });

    await this.prisma.asset.update({
      where: { id: createAssetLoanDto.asset_id },
      data: { status: 'loaned' },
    });

    return loan;
  }

  async findAll(pagination: PaginationDto, filters: { employee_id?: string; asset_id?: string; status?: string }) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.employee_id) where.employee_id = filters.employee_id;
    if (filters.asset_id) where.asset_id = filters.asset_id;
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      this.prisma.assetLoan.findMany({
        where,
        skip,
        take: limit,
        include: {
          asset: true,
          employee: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.assetLoan.count({ where }),
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

  async findOne(id: string) {
    const loan = await this.prisma.assetLoan.findUnique({
      where: { id },
      include: {
        asset: true,
        employee: true,
      },
    });
    if (!loan) throw new NotFoundException(`Asset loan with ID ${id} not found`);
    return loan;
  }

  async returnAsset(id: string, condition: string) {
    const loan = await this.prisma.assetLoan.findUnique({
      where: { id },
      include: { asset: true },
    });
    if (!loan) throw new NotFoundException(`Asset loan with ID ${id} not found`);
    if (loan.status === 'returned') {
      throw new BadRequestException('Asset already returned');
    }

    const updatedLoan = await this.prisma.assetLoan.update({
      where: { id },
      data: {
        status: 'returned',
        actual_return_date: new Date(),
        condition_on_return: condition,
      },
      include: {
        asset: true,
        employee: true,
      },
    });

    await this.prisma.asset.update({
      where: { id: loan.asset_id },
      data: { status: 'available' },
    });

    return updatedLoan;
  }

  async checkActiveLoans(employeeId: string) {
    return this.prisma.assetLoan.findMany({
      where: {
        employee_id: employeeId,
        status: 'borrowed',
      },
      include: {
        asset: true,
      },
    });
  }

  async update(id: string, updateAssetLoanDto: any) {
    const loan = await this.prisma.assetLoan.findUnique({ where: { id } });
    if (!loan) throw new NotFoundException(`Asset loan with ID ${id} not found`);

    return this.prisma.assetLoan.update({
      where: { id },
      data: updateAssetLoanDto,
      include: {
        asset: true,
        employee: true,
      },
    });
  }

  async remove(id: string) {
    const loan = await this.prisma.assetLoan.findUnique({
      where: { id },
      include: { asset: true },
    });
    if (!loan) throw new NotFoundException(`Asset loan with ID ${id} not found`);

    if (loan.status === 'borrowed') {
      await this.prisma.asset.update({
        where: { id: loan.asset_id },
        data: { status: 'available' },
      });
    }

    return this.prisma.assetLoan.delete({ where: { id } });
  }
}
