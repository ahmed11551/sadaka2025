// Zakat Repository - Database operations for zakat calculations

import prisma from '../db/client';
// import { Prisma } from '@prisma/client'; // MongoDB only

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export class ZakatRepository {
  async create(data: {
    userId: string;
    payloadJson: string;
    zakatDue: Prisma.Decimal;
    aboveNisab: boolean;
  }) {
    return prisma.zakatCalc.create({
      data: {
        userId: data.userId,
        payloadJson: data.payloadJson,
        zakatDue: data.zakatDue,
        aboveNisab: data.aboveNisab,
      },
    });
  }

  async findByUser(userId: string, pagination: PaginationParams = {}) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [calculations, total] = await Promise.all([
      prisma.zakatCalc.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.zakatCalc.count({
        where: { userId },
      }),
    ]);

    return {
      calculations,
      total,
      page,
      limit,
    };
  }

  async findById(id: string) {
    return prisma.zakatCalc.findUnique({
      where: { id },
    });
  }
}

