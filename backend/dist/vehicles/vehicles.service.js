"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const date_fns_1 = require("date-fns");
let VehiclesService = class VehiclesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createVehicleDto) {
        const { plateNumber, vehicleType, color, ownerName, taxStatus, taxExpiryDate } = createVehicleDto;
        const existingVehicle = await this.prisma.vehicle.findUnique({
            where: { plateNumber },
        });
        if (existingVehicle) {
            throw new common_1.ConflictException('Vehicle with this plate number already exists');
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
    async findAll(query) {
        const { page = 1, limit = 10, search, type, taxStatus, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const skip = (page - 1) * limit;
        const where = {
            isActive: true,
        };
        if (search) {
            where.OR = [
                { plateNumber: { contains: search } },
                { ownerName: { contains: search } },
                { color: { contains: search } },
            ];
        }
        if (type) {
            where.vehicleType = type;
        }
        if (taxStatus) {
            where.taxStatus = taxStatus;
        }
        if (startDate || endDate) {
            where.scans = {
                some: {
                    scanTime: {},
                },
            };
        }
        if (startDate) {
            const start = (0, date_fns_1.parseISO)(startDate);
            if ((0, date_fns_1.isValid)(start)) {
                where.scans.some.scanTime.gte = start;
            }
        }
        if (endDate) {
            const end = (0, date_fns_1.parseISO)(endDate);
            if ((0, date_fns_1.isValid)(end)) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Vehicle not found');
        }
        return vehicle;
    }
    async findByPlateNumber(plateNumber) {
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
    async update(id, updateVehicleDto) {
        const existingVehicle = await this.prisma.vehicle.findUnique({
            where: { id },
        });
        if (!existingVehicle) {
            throw new common_1.NotFoundException('Vehicle not found');
        }
        if (updateVehicleDto.plateNumber && updateVehicleDto.plateNumber !== existingVehicle.plateNumber) {
            const plateConflict = await this.prisma.vehicle.findUnique({
                where: { plateNumber: updateVehicleDto.plateNumber },
            });
            if (plateConflict) {
                throw new common_1.ConflictException('Vehicle with this plate number already exists');
            }
        }
        const updateData = { ...updateVehicleDto };
        if (updateVehicleDto.taxExpiryDate) {
            updateData.taxExpiryDate = new Date(updateVehicleDto.taxExpiryDate);
        }
        return this.prisma.vehicle.update({
            where: { id },
            data: updateData,
        });
    }
    async remove(id) {
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
            throw new common_1.NotFoundException('Vehicle not found');
        }
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
    async updateTaxStatus(id, taxStatus, taxExpiryDate) {
        const updateData = { taxStatus };
        if (taxExpiryDate) {
            updateData.taxExpiryDate = new Date(taxExpiryDate);
        }
        return this.prisma.vehicle.update({
            where: { id },
            data: updateData,
        });
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map