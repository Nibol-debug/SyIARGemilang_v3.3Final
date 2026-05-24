import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import * as QRCode from 'qrcode';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async create(createAssetDto: CreateAssetDto) {
    const qrCodeBase64 = await QRCode.toDataURL(createAssetDto.code);
    return this.prisma.asset.create({
      data: {
        ...createAssetDto,
        qr_code: qrCodeBase64,
      },
    });
  }

  async findAll(pagination: PaginationDto, filters: { search?: string; category?: string; condition?: string; status?: string }) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { code: { contains: filters.search } },
      ];
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.condition) {
      where.condition = filters.condition;
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.asset.count({ where }),
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
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });
    if (!asset) throw new NotFoundException(`Asset with ID ${id} not found`);
    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto) {
    const currentAsset = await this.prisma.asset.findUnique({ where: { id } });
    if (!currentAsset) throw new NotFoundException(`Asset with ID ${id} not found`);

    const data: any = { ...updateAssetDto };
    if (updateAssetDto.code && updateAssetDto.code !== currentAsset.code) {
      data.qr_code = await QRCode.toDataURL(updateAssetDto.code);
    }

    return this.prisma.asset.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.asset.delete({
      where: { id },
    });
  }
}
