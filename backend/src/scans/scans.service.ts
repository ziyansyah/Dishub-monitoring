import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateScanDto } from './dto/create-scan.dto';
import { QueryScansDto } from './dto/query-scans.dto';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isAfter, isBefore, isValid } from 'date-fns';

@Injectable()
export class ScansService {
  constructor(private prisma: PrismaService) {}

  async create(createScanDto: CreateScanDto, userId: string, ipAddress: string, userAgent: string) {
    const { plateNumber, vehicleType, color, ownerName, taxStatus, location, metadata } = createScanDto;

    // Check if vehicle exists in database
    let vehicle = await this.prisma.vehicle.findUnique({
      where: { plateNumber },
    });

    // If vehicle doesn't exist, create it
    if (!vehicle) {
      vehicle = await this.prisma.vehicle.create({
        data: {
          plateNumber,
          vehicleType,
          color,
          ownerName: ownerName || 'Unknown',
          taxStatus: taxStatus || 'Mati',
        },
      });
    } else {
      // Update vehicle info if provided
      if (ownerName || taxStatus || vehicleType || color) {
        await this.prisma.vehicle.update({
          where: { id: vehicle.id },
          data: {
            ...(ownerName && { ownerName }),
            ...(taxStatus && { taxStatus }),
            ...(vehicleType && { vehicleType }),
            ...(color && { color }),
          },
        });
      }
    }

    // Create scan record
    const scanData: any = {
      plateNumber,
      vehicleType: vehicle.vehicleType,
      color: vehicle.color,
      ownerName: vehicle.ownerName,
      taxStatus: vehicle.taxStatus,
      vehicleId: vehicle.id,
      userId,
      ipAddress,
      userAgent,
      location: location || 'Unknown',
    };

    // Add metadata if provided
    if (metadata) {
      scanData.details = JSON.stringify(metadata);
    }

    const scan = await this.prisma.scan.create({
      data: scanData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    // Log the scan activity
    await this.prisma.activityLog.create({
      data: {
        action: 'Scan Vehicle',
        userId,
        ipAddress,
        userAgent,
        status: 'success',
        details: `Scanned vehicle: ${plateNumber} - ${ownerName || vehicle.ownerName}`,
      },
    });

    return scan;
  }

  async findAll(query: QueryScansDto) {
    const {
      page = 1,
      limit = 10,
      search,
      filter,
      vehicleType,
      taxStatus,
      userId,
      location,
      startDate,
      endDate,
      sortBy = 'scanTime',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    // Time-based filtering
    if (filter) {
      const now = new Date();
      let startDateFilter: Date;
      let endDateFilter: Date;

      switch (filter) {
        case 'today':
          startDateFilter = startOfDay(now);
          endDateFilter = endOfDay(now);
          break;
        case 'week':
          startDateFilter = startOfWeek(now, { weekStartsOn: 1 }); // Monday
          endDateFilter = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case 'month':
          startDateFilter = startOfMonth(now);
          endDateFilter = endOfMonth(now);
          break;
        default:
          startDateFilter = startOfDay(now);
          endDateFilter = endOfDay(now);
      }

      where.scanTime = {
        gte: startDateFilter,
        lte: endDateFilter,
      };
    }

    // Custom date range
    if (startDate || endDate) {
      where.scanTime = { ...where.scanTime };

      if (startDate) {
        const start = parseISO(startDate);
        if (isValid(start)) {
          where.scanTime.gte = start;
        }
      }

      if (endDate) {
        const end = parseISO(endDate);
        if (isValid(end)) {
          where.scanTime.lte = end;
        }
      }
    }

    // Search by plate number, owner name, location
    if (search) {
      where.OR = [
        { plateNumber: { contains: search } },
        { ownerName: { contains: search } },
        { location: { contains: search } },
      ];
    }

    // Filter by vehicle type
    if (vehicleType) {
      where.vehicleType = vehicleType;
    }

    // Filter by tax status
    if (taxStatus) {
      where.taxStatus = taxStatus;
    }

    // Filter by user
    if (userId) {
      where.userId = userId;
    }

    // Filter by location
    if (location) {
      where.location = { contains: location };
    }

    const [scans, total] = await Promise.all([
      this.prisma.scan.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              plateNumber: true,
              taxStatus: true,
              taxExpiryDate: true,
            },
          },
        },
      }),
      this.prisma.scan.count({ where }),
    ]);

    return {
      data: scans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findRecent(limit: number = 10) {
    return this.prisma.scan.findMany({
      take: limit,
      orderBy: {
        scanTime: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            plateNumber: true,
            taxStatus: true,
            taxExpiryDate: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const scan = await this.prisma.scan.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            role: {
              select: {
                name: true,
              },
            },
          },
        },
        vehicle: {
          include: {
            _count: {
              select: {
                scans: true,
              },
            },
          },
        },
      },
    });

    if (!scan) {
      throw new NotFoundException('Scan not found');
    }

    return scan;
  }

  async getHistory(query: QueryScansDto) {
    const { filter = 'today', page = 1, limit = 10 } = query;

    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (filter) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      default:
        startDate = startOfDay(now);
        endDate = endOfDay(now);
    }

    const where = {
      scanTime: {
        gte: startDate,
        lte: endDate,
      },
    };

    const [scans, total] = await Promise.all([
      this.prisma.scan.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          scanTime: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.scan.count({ where }),
    ]);

    return {
      data: scans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      period: {
        filter,
        startDate,
        endDate,
      },
    };
  }

  async getScanStats() {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const [
      totalScans,
      scansToday,
      uniqueVehiclesScanned,
      taxActiveScans,
      taxInactiveScans,
    ] = await Promise.all([
      this.prisma.scan.count(),
      this.prisma.scan.count({
        where: {
          scanTime: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      this.prisma.scan.groupBy({
        by: ['plateNumber'],
        _count: {
          plateNumber: true,
        },
      }),
      this.prisma.scan.count({
        where: { taxStatus: 'Aktif' },
      }),
      this.prisma.scan.count({
        where: { taxStatus: 'Mati' },
      }),
    ]);

    // Get weekly trend data
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weeklyData = [];

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(weekStart);
      dayStart.setDate(dayStart.getDate() + i);
      const dayEnd = endOfDay(dayStart);

      const dayCount = await this.prisma.scan.count({
        where: {
          scanTime: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      weeklyData.push({
        day: format(dayStart, 'EEE'),
        count: dayCount,
        date: dayStart,
      });
    }

    // Get vehicle type distribution
    const vehicleTypeStats = await this.prisma.scan.groupBy({
      by: ['vehicleType'],
      _count: {
        vehicleType: true,
      },
    });

    return {
      totalScans,
      scansToday,
      uniqueVehiclesScanned: uniqueVehiclesScanned.length,
      taxActiveScans,
      taxInactiveScans,
      weeklyTrend: weeklyData,
      vehicleTypeDistribution: vehicleTypeStats.map(stat => ({
        type: stat.vehicleType,
        count: stat._count.vehicleType,
      })),
    };
  }

  async deleteScan(id: string, userId: string) {
    const scan = await this.prisma.scan.findUnique({
      where: { id },
    });

    if (!scan) {
      throw new NotFoundException('Scan not found');
    }

    await this.prisma.scan.delete({
      where: { id },
    });

    // Log the deletion
    await this.prisma.activityLog.create({
      data: {
        action: 'Delete Scan',
        userId,
        status: 'success',
        details: `Deleted scan record: ${scan.plateNumber}`,
      },
    });

    return { message: 'Scan deleted successfully' };
  }

  async getScanLocations() {
    return this.prisma.scan.groupBy({
      by: ['location'],
      _count: {
        location: true,
      },
      orderBy: {
        _count: {
          location: 'desc',
        },
      },
      take: 20,
    });
  }

  async getTopScannedVehicles(limit: number = 10) {
    return this.prisma.scan.groupBy({
      by: ['plateNumber'],
      _count: {
        plateNumber: true,
      },
      orderBy: {
        _count: {
          plateNumber: 'desc',
        },
      },
      take: limit,
    });
  }
}