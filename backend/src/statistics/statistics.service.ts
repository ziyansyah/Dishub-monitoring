import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Get basic counts
    const [
      totalVehicles,
      taxActive,
      taxInactive,
      scansToday,
      totalScans,
    ] = await Promise.all([
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
      });
    }

    // Get tax status distribution
    const taxStatusData = [
      { name: 'Lunas', value: taxActive },
      { name: 'Belum Lunas', value: taxInactive },
    ];

    // Get monthly trend (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(monthStart);

      const monthCount = await this.prisma.scan.count({
        where: {
          scanTime: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      monthlyData.push({
        month: format(monthStart, 'MMM yyyy'),
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
      percentage: 0, // Will be calculated
    }));
  }

  async getTaxComplianceStats() {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalVehicles,
      taxActive,
      taxExpired,
      taxExpiringSoon,
    ] = await Promise.all([
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

    // Get monthly compliance trend
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(monthStart);

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
        month: format(monthStart, 'MMM yyyy'),
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

    // Get last 4 weeks data
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

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
        startDate: format(weekStart, 'dd MMM'),
        endDate: format(weekEnd, 'dd MMM'),
        scans: scansCount,
        uniqueVehicles: uniqueVehicles.length,
        avgScansPerDay: Math.round(scansCount / 7),
      });
    }

    return weeklyData;
  }

  async getScanActivityHeatmap() {
    const now = new Date();
    const last30Days = subDays(now, 30);

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

    // Create heatmap data (hour x day grid)
    const heatmapData = [];
    const hourlyActivity = Array(24).fill(0);

    for (let day = 0; day < 30; day++) {
      const date = subDays(now, 29 - day);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const dayScans = scans.filter(scan =>
        scan.scanTime >= dayStart && scan.scanTime <= dayEnd
      );

      // Create hourly breakdown for this day
      const hourData = Array(24).fill(0);
      dayScans.forEach(scan => {
        const hour = scan.scanTime.getHours();
        hourData[hour]++;
        hourlyActivity[hour]++;
      });

      heatmapData.push({
        date: format(date, 'yyyy-MM-dd'),
        day: format(date, 'dd'),
        weekday: format(date, 'EEE'),
        hours: hourData,
        total: dayScans.length,
      });
    }

    // Peak hours analysis
    const hourlyStats = hourlyActivity.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      count,
      percentage: scans.length > 0 ? Math.round((count / scans.length) * 100) : 0,
    }));

    const peakHour = hourlyStats.reduce((max, curr) =>
      curr.count > max.count ? curr : max, hourlyStats[0]
    );

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

    // Get role-based activity
    const roleStats = await this.prisma.scan.groupBy({
      by: ['plateNumber'], // This will be used to join with user data
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
    const last30Days = subDays(now, 30);

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
    }, {} as Record<string, { count: number; successful: number }>);

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
}