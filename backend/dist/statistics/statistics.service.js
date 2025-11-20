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
exports.StatisticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const date_fns_1 = require("date-fns");
let StatisticsService = class StatisticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const now = new Date();
        const todayStart = (0, date_fns_1.startOfDay)(now);
        const todayEnd = (0, date_fns_1.endOfDay)(now);
        const [totalVehicles, taxActive, taxInactive, scansToday, totalScans,] = await Promise.all([
            this.prisma.vehicle.count({
                where: { isActive: true },
            }),
            this.prisma.vehicle.count({
                where: {
                    isActive: true,
                    taxStatus: 'Aktif',
                },
            }),
            this.prisma.vehicle.count({
                where: {
                    isActive: true,
                    taxStatus: 'Mati',
                },
            }),
            this.prisma.scan.count({
                where: {
                    scanTime: {
                        gte: todayStart,
                        lte: todayEnd,
                    },
                },
            }),
            this.prisma.scan.count(),
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
            });
        }
        const taxStatusData = [
            { name: 'Lunas', value: taxActive },
            { name: 'Belum Lunas', value: taxInactive },
        ];
        const monthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, i));
            const monthEnd = (0, date_fns_1.endOfMonth)(monthStart);
            const monthCount = await this.prisma.scan.count({
                where: {
                    scanTime: {
                        gte: monthStart,
                        lte: monthEnd,
                    },
                },
            });
            monthlyData.push({
                month: (0, date_fns_1.format)(monthStart, 'MMM yyyy'),
                count: monthCount,
            });
        }
        return {
            totalVehicles,
            taxActive,
            taxInactive,
            scansToday,
            totalScans,
            trends: {
                weekly: weeklyData,
                taxStatus: taxStatusData,
                monthly: monthlyData,
            },
            complianceRate: totalVehicles > 0 ? Math.round((taxActive / totalVehicles) * 100) : 0,
        };
    }
    async getVehicleTypeDistribution() {
        const vehicleTypes = await this.prisma.vehicle.groupBy({
            by: ['vehicleType'],
            where: { isActive: true },
            _count: {
                id: true,
            },
        });
        return vehicleTypes.map(type => ({
            type: type.vehicleType,
            count: type._count.id,
            percentage: 0,
        }));
    }
    async getTaxComplianceStats() {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const [totalVehicles, taxActive, taxExpired, taxExpiringSoon,] = await Promise.all([
            this.prisma.vehicle.count({
                where: { isActive: true },
            }),
            this.prisma.vehicle.count({
                where: {
                    isActive: true,
                    taxStatus: 'Aktif',
                    OR: [
                        { taxExpiryDate: null },
                        { taxExpiryDate: { gt: thirtyDaysFromNow } },
                    ],
                },
            }),
            this.prisma.vehicle.count({
                where: {
                    isActive: true,
                    OR: [
                        { taxStatus: 'Mati' },
                        {
                            taxExpiryDate: {
                                lt: now
                            }
                        },
                    ],
                },
            }),
            this.prisma.vehicle.count({
                where: {
                    isActive: true,
                    taxStatus: 'Aktif',
                    taxExpiryDate: {
                        gte: now,
                        lte: thirtyDaysFromNow,
                    },
                },
            }),
        ]);
        const complianceRate = totalVehicles > 0 ? Math.round((taxActive / totalVehicles) * 100) : 0;
        const monthlyTrend = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(now, i));
            const monthEnd = (0, date_fns_1.endOfMonth)(monthStart);
            const [monthTotal, monthActive] = await Promise.all([
                this.prisma.vehicle.count({
                    where: {
                        isActive: true,
                        createdAt: { lte: monthEnd },
                    },
                }),
                this.prisma.vehicle.count({
                    where: {
                        isActive: true,
                        taxStatus: 'Aktif',
                        createdAt: { lte: monthEnd },
                    },
                }),
            ]);
            monthlyTrend.push({
                month: (0, date_fns_1.format)(monthStart, 'MMM yyyy'),
                compliance: monthTotal > 0 ? Math.round((monthActive / monthTotal) * 100) : 0,
                total: monthTotal,
                active: monthActive,
            });
        }
        return {
            totalVehicles,
            taxActive,
            taxExpired,
            taxExpiringSoon,
            complianceRate,
            monthlyTrend,
        };
    }
    async getWeeklyTrends() {
        const now = new Date();
        const weeklyData = [];
        for (let i = 3; i >= 0; i--) {
            const weekStart = (0, date_fns_1.startOfWeek)((0, date_fns_1.subWeeks)(now, i), { weekStartsOn: 1 });
            const weekEnd = (0, date_fns_1.endOfWeek)(weekStart, { weekStartsOn: 1 });
            const [scansCount, uniqueVehicles] = await Promise.all([
                this.prisma.scan.count({
                    where: {
                        scanTime: {
                            gte: weekStart,
                            lte: weekEnd,
                        },
                    },
                }),
                this.prisma.scan.groupBy({
                    by: ['plateNumber'],
                    where: {
                        scanTime: {
                            gte: weekStart,
                            lte: weekEnd,
                        },
                    },
                }),
            ]);
            weeklyData.push({
                week: `Week ${4 - i}`,
                startDate: (0, date_fns_1.format)(weekStart, 'dd MMM'),
                endDate: (0, date_fns_1.format)(weekEnd, 'dd MMM'),
                scans: scansCount,
                uniqueVehicles: uniqueVehicles.length,
                avgScansPerDay: Math.round(scansCount / 7),
            });
        }
        return weeklyData;
    }
    async getScanActivityHeatmap() {
        const now = new Date();
        const last30Days = (0, date_fns_1.subDays)(now, 30);
        const scans = await this.prisma.scan.findMany({
            where: {
                scanTime: {
                    gte: last30Days,
                },
            },
            select: {
                scanTime: true,
            },
        });
        const heatmapData = [];
        const hourlyActivity = Array(24).fill(0);
        for (let day = 0; day < 30; day++) {
            const date = (0, date_fns_1.subDays)(now, 29 - day);
            const dayStart = (0, date_fns_1.startOfDay)(date);
            const dayEnd = (0, date_fns_1.endOfDay)(date);
            const dayScans = scans.filter(scan => scan.scanTime >= dayStart && scan.scanTime <= dayEnd);
            const hourData = Array(24).fill(0);
            dayScans.forEach(scan => {
                const hour = scan.scanTime.getHours();
                hourData[hour]++;
                hourlyActivity[hour]++;
            });
            heatmapData.push({
                date: (0, date_fns_1.format)(date, 'yyyy-MM-dd'),
                day: (0, date_fns_1.format)(date, 'dd'),
                weekday: (0, date_fns_1.format)(date, 'EEE'),
                hours: hourData,
                total: dayScans.length,
            });
        }
        const hourlyStats = hourlyActivity.map((count, hour) => ({
            hour: `${hour.toString().padStart(2, '0')}:00`,
            count,
            percentage: scans.length > 0 ? Math.round((count / scans.length) * 100) : 0,
        }));
        const peakHour = hourlyStats.reduce((max, curr) => curr.count > max.count ? curr : max, hourlyStats[0]);
        return {
            heatmapData,
            hourlyStats,
            peakHour,
            totalScans: scans.length,
        };
    }
    async getLocationStats() {
        const locationData = await this.prisma.scan.groupBy({
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
        const totalScans = await this.prisma.scan.count();
        return locationData.map(location => ({
            location: location.location === 'Unknown' ? 'Tidak Diketahui' : location.location,
            count: location._count.location,
            percentage: Math.round((location._count.location / totalScans) * 100),
        }));
    }
    async getUserActivityStats() {
        const userStats = await this.prisma.user.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: {
                        scans: true,
                    },
                },
                role: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                scans: {
                    _count: 'desc',
                },
            },
            take: 10,
        });
        const roleStats = await this.prisma.scan.groupBy({
            by: ['plateNumber'],
            _count: {
                plateNumber: true,
            },
        });
        return {
            topUsers: userStats.map(user => ({
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role.name,
                scansCount: user._count.scans,
            })),
            totalActiveUsers: userStats.length,
        };
    }
    async getExportStats() {
        const now = new Date();
        const last30Days = (0, date_fns_1.subDays)(now, 30);
        const reports = await this.prisma.report.findMany({
            where: {
                createdAt: {
                    gte: last30Days,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        const reportStats = reports.reduce((acc, report) => {
            const key = report.fileFormat;
            if (!acc[key]) {
                acc[key] = { count: 0, successful: 0 };
            }
            acc[key].count++;
            if (report.status === 'completed') {
                acc[key].successful++;
            }
            return acc;
        }, {});
        return {
            totalReports: reports.length,
            successfulReports: reports.filter(r => r.status === 'completed').length,
            formatStats: Object.entries(reportStats).map(([format, stats]) => ({
                format: format.toUpperCase(),
                total: stats.count,
                successful: stats.successful,
                successRate: Math.round((stats.successful / stats.count) * 100),
            })),
            recentReports: reports.slice(0, 5).map(report => ({
                id: report.id,
                title: report.title,
                format: report.fileFormat.toUpperCase(),
                status: report.status,
                createdAt: report.createdAt,
            })),
        };
    }
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatisticsService);
//# sourceMappingURL=statistics.service.js.map