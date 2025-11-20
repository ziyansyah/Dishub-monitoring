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
exports.ScansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const date_fns_1 = require("date-fns");
let ScansService = class ScansService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createScanDto, userId, ipAddress, userAgent) {
        const { plateNumber, vehicleType, color, ownerName, taxStatus, location, metadata } = createScanDto;
        let vehicle = await this.prisma.vehicle.findUnique({
            where: { plateNumber },
        });
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
        }
        else {
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
        const scanData = {
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
    async findAll(query) {
        const { page = 1, limit = 10, search, filter, vehicleType, taxStatus, userId, location, startDate, endDate, sortBy = 'scanTime', sortOrder = 'desc', } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (filter) {
            const now = new Date();
            let startDateFilter;
            let endDateFilter;
            switch (filter) {
                case 'today':
                    startDateFilter = (0, date_fns_1.startOfDay)(now);
                    endDateFilter = (0, date_fns_1.endOfDay)(now);
                    break;
                case 'week':
                    startDateFilter = (0, date_fns_1.startOfWeek)(now, { weekStartsOn: 1 });
                    endDateFilter = (0, date_fns_1.endOfWeek)(now, { weekStartsOn: 1 });
                    break;
                case 'month':
                    startDateFilter = (0, date_fns_1.startOfMonth)(now);
                    endDateFilter = (0, date_fns_1.endOfMonth)(now);
                    break;
                default:
                    startDateFilter = (0, date_fns_1.startOfDay)(now);
                    endDateFilter = (0, date_fns_1.endOfDay)(now);
            }
            where.scanTime = {
                gte: startDateFilter,
                lte: endDateFilter,
            };
        }
        if (startDate || endDate) {
            where.scanTime = { ...where.scanTime };
            if (startDate) {
                const start = (0, date_fns_1.parseISO)(startDate);
                if ((0, date_fns_1.isValid)(start)) {
                    where.scanTime.gte = start;
                }
            }
            if (endDate) {
                const end = (0, date_fns_1.parseISO)(endDate);
                if ((0, date_fns_1.isValid)(end)) {
                    where.scanTime.lte = end;
                }
            }
        }
        if (search) {
            where.OR = [
                { plateNumber: { contains: search } },
                { ownerName: { contains: search } },
                { location: { contains: search } },
            ];
        }
        if (vehicleType) {
            where.vehicleType = vehicleType;
        }
        if (taxStatus) {
            where.taxStatus = taxStatus;
        }
        if (userId) {
            where.userId = userId;
        }
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
    async findRecent(limit = 10) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Scan not found');
        }
        return scan;
    }
    async getHistory(query) {
        const { filter = 'today', page = 1, limit = 10 } = query;
        const now = new Date();
        let startDate;
        let endDate;
        switch (filter) {
            case 'today':
                startDate = (0, date_fns_1.startOfDay)(now);
                endDate = (0, date_fns_1.endOfDay)(now);
                break;
            case 'week':
                startDate = (0, date_fns_1.startOfWeek)(now, { weekStartsOn: 1 });
                endDate = (0, date_fns_1.endOfWeek)(now, { weekStartsOn: 1 });
                break;
            case 'month':
                startDate = (0, date_fns_1.startOfMonth)(now);
                endDate = (0, date_fns_1.endOfMonth)(now);
                break;
            default:
                startDate = (0, date_fns_1.startOfDay)(now);
                endDate = (0, date_fns_1.endOfDay)(now);
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
        const todayStart = (0, date_fns_1.startOfDay)(now);
        const todayEnd = (0, date_fns_1.endOfDay)(now);
        const [totalScans, scansToday, uniqueVehiclesScanned, taxActiveScans, taxInactiveScans,] = await Promise.all([
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
        const weekStart = (0, date_fns_1.startOfWeek)(now, { weekStartsOn: 1 });
        const weeklyData = [];
        for (let i = 0; i < 7; i++) {
            const dayStart = new Date(weekStart);
            dayStart.setDate(dayStart.getDate() + i);
            const dayEnd = (0, date_fns_1.endOfDay)(dayStart);
            const dayCount = await this.prisma.scan.count({
                where: {
                    scanTime: {
                        gte: dayStart,
                        lte: dayEnd,
                    },
                },
            });
            weeklyData.push({
                day: (0, date_fns_1.format)(dayStart, 'EEE'),
                count: dayCount,
                date: dayStart,
            });
        }
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
    async deleteScan(id, userId) {
        const scan = await this.prisma.scan.findUnique({
            where: { id },
        });
        if (!scan) {
            throw new common_1.NotFoundException('Scan not found');
        }
        await this.prisma.scan.delete({
            where: { id },
        });
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
    async getTopScannedVehicles(limit = 10) {
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
};
exports.ScansService = ScansService;
exports.ScansService = ScansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScansService);
//# sourceMappingURL=scans.service.js.map