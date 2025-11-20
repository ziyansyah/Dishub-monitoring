import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isAfter, isBefore, isValid } from 'date-fns';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async getLogs(query: any) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      action,
      userId,
      startDate,
      endDate,
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    // Search by user, action, IP, or details
    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { username: { contains: search } } },
        { action: { contains: search } },
        { ipAddress: { contains: search } },
        { details: { contains: search } },
      ];
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by action
    if (action) {
      where.action = action;
    }

    // Filter by user
    if (userId) {
      where.userId = userId;
    }

    // Date range filtering
    if (startDate || endDate) {
      where.timestamp = {};

      if (startDate) {
        const start = parseISO(startDate);
        if (isValid(start)) {
          where.timestamp.gte = start;
        }
      }

      if (endDate) {
        const end = parseISO(endDate);
        if (isValid(end)) {
          where.timestamp.lte = end;
        }
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
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
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getRecentLogs(limit: number = 20) {
    return this.prisma.activityLog.findMany({
      take: limit,
      orderBy: {
        timestamp: 'desc',
      },
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
      },
    });
  }

  async getActivityStats() {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const [
      totalActivities,
      activitiesToday,
      successActivities,
      failedActivities,
    ] = await Promise.all([
      this.prisma.activityLog.count(),
      this.prisma.activityLog.count({
        where: {
          timestamp: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      }),
      this.prisma.activityLog.count({
        where: { status: 'success' },
      }),
      this.prisma.activityLog.count({
        where: { status: 'failed' },
      }),
    ]);

    // Get action distribution
    const actionStats = await this.prisma.activityLog.groupBy({
      by: ['action'],
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
      take: 10,
    });

    // Get hourly activity for today
    const hourlyActivity = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(todayStart);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(todayStart);
      hourEnd.setHours(hour, 59, 59, 999);

      const hourCount = await this.prisma.activityLog.count({
        where: {
          timestamp: {
            gte: hourStart,
            lte: hourEnd,
          },
        },
      });

      hourlyActivity.push({
        hour: `${hour.toString().padStart(2, '0')}:00`,
        count: hourCount,
      });
    }

    // Get top active users
    const topUsers = await this.prisma.activityLog.groupBy({
      by: ['userId'],
      _count: {
        userId: true,
      },
      orderBy: {
        _count: {
          userId: 'desc',
        },
      },
      take: 10,
    });

    const usersWithDetails = await Promise.all(
      topUsers.map(async (userStat) => {
        const user = await this.prisma.user.findUnique({
          where: { id: userStat.userId },
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
        });
        return {
          ...user,
          activityCount: userStat._count.userId,
        };
      })
    );

    return {
      totalActivities,
      activitiesToday,
      successActivities,
      failedActivities,
      successRate: totalActivities > 0 ? Math.round((successActivities / totalActivities) * 100) : 0,
      actionDistribution: actionStats.map(stat => ({
        action: stat.action,
        count: stat._count.action,
      })),
      hourlyActivity,
      topUsers: usersWithDetails.filter(Boolean),
    };
  }

  async exportToCSV(query: any) {
    const logs = await this.prisma.activityLog.findMany({
      where: this.buildWhereClause(query),
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        user: {
          select: {
            username: true,
            name: true,
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      take: 10000, // Limit for export
    });

    const csvData = logs.map(log => ({
      Timestamp: format(log.timestamp, 'yyyy-MM-dd HH:mm:ss'),
      User: log.user?.name || 'System',
      Username: log.user?.username || 'system',
      Role: log.user?.role?.name || 'System',
      Action: log.action,
      Status: log.status,
      'IP Address': log.ipAddress || 'N/A',
      'User Agent': log.userAgent || 'N/A',
      Details: log.details || '',
    }));

    const csvStringifier = csv.stringify({
      header: true,
      columns: [
        'Timestamp',
        'User',
        'Username',
        'Role',
        'Action',
        'Status',
        'IP Address',
        'User Agent',
        'Details',
      ],
    });

    return csvStringifier(csvData);
  }

  async logActivity(action: string, userId: string, ipAddress: string, userAgent: string, status: 'success' | 'failed', details?: string) {
    try {
      await this.prisma.activityLog.create({
        data: {
          action,
          userId,
          ipAddress,
          userAgent,
          status,
          details,
        },
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  async getActionsList() {
    const actions = await this.prisma.activityLog.groupBy({
      by: ['action'],
      _count: {
        action: true,
      },
      orderBy: {
        action: 'asc',
      },
    });

    return actions.map(action => action.action);
  }

  async getActivityByUser(userId: string, limit: number = 50) {
    return this.prisma.activityLog.findMany({
      where: { userId },
      take: limit,
      orderBy: {
        timestamp: 'desc',
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
  }

  async getFailedActivities() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return this.prisma.activityLog.findMany({
      where: {
        status: 'failed',
        timestamp: {
          gte: last24Hours,
        },
      },
      orderBy: {
        timestamp: 'desc',
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
      take: 50,
    });
  }

  async getSystemActivities() {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return this.prisma.activityLog.findMany({
      where: {
        userId: 'system',
        timestamp: {
          gte: last7Days,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
    });
  }

  private buildWhereClause(query: any) {
    const where: any = {};

    if (query.search) {
      where.OR = [
        { user: { name: { contains: query.search } } },
        { user: { username: { contains: query.search } } },
        { action: { contains: query.search } },
        { ipAddress: { contains: query.search } },
        { details: { contains: query.search } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.startDate || query.endDate) {
      where.timestamp = {};

      if (query.startDate) {
        const start = parseISO(query.startDate);
        if (isValid(start)) {
          where.timestamp.gte = start;
        }
      }

      if (query.endDate) {
        const end = parseISO(query.endDate);
        if (isValid(end)) {
          where.timestamp.lte = end;
        }
      }
    }

    return where;
  }
}