import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehiclesDto } from './dto/query-vehicles.dto';
import { format, parseISO, isAfter, isBefore, isValid } from 'date-fns';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto) {
    const { plateNumber, vehicleType, color, ownerName, taxStatus, taxExpiryDate } = createVehicleDto;

    // Check if vehicle already exists
    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { plateNumber },
    });

    if (existingVehicle) {
      throw new ConflictException('Vehicle with this plate number already exists');
    }

    return this.prisma.vehicle.create({
      data: {
        plateNumber,
        vehicleType,
        color,
        ownerName,
        taxStatus,
        taxExpiryDate: taxExpiryDate ? new Date(taxExpiryDate) : null,
      },
    });
  }

  async findAll(query: QueryVehiclesDto) {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      taxStatus,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    // Search by plate number, owner name, color
    if (search) {
      where.OR = [
        { plateNumber: { contains: search } },
        { ownerName: { contains: search } },
        { color: { contains: search } },
      ];
    }

    // Filter by vehicle type
    if (type) {
      where.vehicleType = type;
    }

    // Filter by tax status
    if (taxStatus) {
      where.taxStatus = taxStatus;
    }

    // Filter by scan date range
    if (startDate || endDate) {
      where.scans = {
        some: {
          scanTime: {},
        },
      };
    }

    if (startDate) {
      const start = parseISO(startDate);
      if (isValid(start)) {
        where.scans.some.scanTime.gte = start;
      }
    }

    if (endDate) {
      const end = parseISO(endDate);
      if (isValid(end)) {
        where.scans.some.scanTime.lte = end;
      }
    }

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          _count: {
            select: {
              scans: true,
            },
          },
          scans: {
            take: 1,
            orderBy: {
              scanTime: 'desc',
            },
            select: {
              scanTime: true,
              location: true,
            },
          },
        },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        scans: {
          orderBy: {
            scanTime: 'desc',
          },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            scans: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async findByPlateNumber(plateNumber: string) {
    return this.prisma.vehicle.findUnique({
      where: { plateNumber },
      include: {
        scans: {
          orderBy: {
            scanTime: 'desc',
          },
          take: 5,
        },
      },
    });
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    // Check if vehicle exists
    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existingVehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Check for plate number conflicts
    if (updateVehicleDto.plateNumber && updateVehicleDto.plateNumber !== existingVehicle.plateNumber) {
      const plateConflict = await this.prisma.vehicle.findUnique({
        where: { plateNumber: updateVehicleDto.plateNumber },
      });

      if (plateConflict) {
        throw new ConflictException('Vehicle with this plate number already exists');
      }
    }

    const updateData: any = { ...updateVehicleDto };

    // Convert date string to Date object
    if (updateVehicleDto.taxExpiryDate) {
      updateData.taxExpiryDate = new Date(updateVehicleDto.taxExpiryDate);
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    // Check if vehicle exists
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            scans: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Soft delete by setting isActive to false
    return this.prisma.vehicle.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async getVehicleStats() {
    const totalVehicles = await this.prisma.vehicle.count({
      where: { isActive: true },
    });

    const taxActive = await this.prisma.vehicle.count({
      where: {
        isActive: true,
        taxStatus: 'Aktif',
      },
    });

    const taxInactive = await this.prisma.vehicle.count({
      where: {
        isActive: true,
        taxStatus: 'Mati',
      },
    });

    const vehiclesByType = await this.prisma.vehicle.groupBy({
      by: ['vehicleType'],
      where: {
        isActive: true,
      },
      _count: {
        id: true,
      },
    });

    const recentScans = await this.prisma.scan.findMany({
      take: 10,
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
    });

    return {
      totalVehicles,
      taxActive,
      taxInactive,
      vehiclesByType: vehiclesByType.map(type => ({
        type: type.vehicleType,
        count: type._count.id,
      })),
      recentScans,
    };
  }

  async getTaxExpirySoon() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return this.prisma.vehicle.findMany({
      where: {
        isActive: true,
        taxStatus: 'Aktif',
        taxExpiryDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
      orderBy: {
        taxExpiryDate: 'asc',
      },
      take: 20,
    });
  }

  async updateTaxStatus(id: string, taxStatus: string, taxExpiryDate?: string) {
    const updateData: any = { taxStatus };

    if (taxExpiryDate) {
      updateData.taxExpiryDate = new Date(taxExpiryDate);
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: updateData,
    });
  }
}