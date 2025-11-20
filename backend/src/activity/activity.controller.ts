import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  UseGuards,
  Res,
  Headers,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard, Permissions } from '../auth/guards/permissions.guard';

@ApiTags('Activity')
@Controller('activity')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('logs')
  @Permissions('view')
  @ApiOperation({ summary: 'Get activity logs with filtering' })
  @ApiResponse({ status: 200, description: 'Activity logs retrieved successfully' })
  getLogs(@Query() query: any) {
    return this.activityService.getLogs(query);
  }

  @Get('recent')
  @Permissions('view')
  @ApiOperation({ summary: 'Get recent activity logs' })
  @ApiResponse({ status: 200, description: 'Recent activity logs retrieved successfully' })
  getRecentLogs(@Query('limit') limit?: number) {
    return this.activityService.getRecentLogs(limit ? parseInt(limit) : 20);
  }

  @Get('stats')
  @Permissions('view')
  @ApiOperation({ summary: 'Get activity statistics' })
  @ApiResponse({ status: 200, description: 'Activity statistics retrieved successfully' })
  getStats() {
    return this.activityService.getActivityStats();
  }

  @Get('actions')
  @Permissions('view')
  @ApiOperation({ summary: 'Get list of all activity types' })
  @ApiResponse({ status: 200, description: 'Activity types retrieved successfully' })
  getActionsList() {
    return this.activityService.getActionsList();
  }

  @Get('user/:userId')
  @Permissions('view')
  @ApiOperation({ summary: 'Get activities by user' })
  @ApiResponse({ status: 200, description: 'User activities retrieved successfully' })
  getActivitiesByUser(@Param('userId') userId: string, @Query('limit') limit?: number) {
    return this.activityService.getActivityByUser(userId, limit ? parseInt(limit) : 50);
  }

  @Get('failed')
  @Permissions('view')
  @ApiOperation({ summary: 'Get failed activities (last 24 hours)' })
  @ApiResponse({ status: 200, description: 'Failed activities retrieved successfully' })
  getFailedActivities() {
    return this.activityService.getFailedActivities();
  }

  @Get('system')
  @Permissions('view')
  @ApiOperation({ summary: 'Get system activities (last 7 days)' })
  @ApiResponse({ status: 200, description: 'System activities retrieved successfully' })
  getSystemActivities() {
    return this.activityService.getSystemActivities();
  }

  @Post('export')
  @Permissions('export')
  @ApiOperation({ summary: 'Export activity logs to CSV' })
  @ApiResponse({ status: 200, description: 'Activity logs exported successfully' })
  async exportToCSV(
    @Body() query: any,
    @Res() res: Response,
    @Headers('user-agent') userAgent: string,
  ) {
    try {
      const csvData = await this.activityService.exportToCSV(query);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="activity-logs-${new Date().toISOString().split('T')[0]}.csv"`);

      res.send(csvData);

      // Log the export activity
      await this.activityService.logActivity(
        'Export Activity Logs',
        'system',
        'N/A',
        userAgent || 'Unknown',
        'success',
        'Exported activity logs to CSV'
      );
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to export activity logs',
        error: error.message,
      });
    }
  }
}