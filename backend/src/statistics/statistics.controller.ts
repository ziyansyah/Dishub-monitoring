import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard, Permissions } from '../auth/guards/permissions.guard';

@ApiTags('Statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  @Permissions('view')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  getDashboardStats() {
    return this.statisticsService.getDashboardStats();
  }

  @Get('vehicle-types')
  @Permissions('view')
  @ApiOperation({ summary: 'Get vehicle type distribution' })
  @ApiResponse({ status: 200, description: 'Vehicle type distribution retrieved successfully' })
  getVehicleTypeDistribution() {
    return this.statisticsService.getVehicleTypeDistribution();
  }

  @Get('tax-compliance')
  @Permissions('view')
  @ApiOperation({ summary: 'Get tax compliance statistics' })
  @ApiResponse({ status: 200, description: 'Tax compliance statistics retrieved successfully' })
  getTaxComplianceStats() {
    return this.statisticsService.getTaxComplianceStats();
  }

  @Get('weekly-trends')
  @Permissions('view')
  @ApiOperation({ summary: 'Get weekly scanning trends' })
  @ApiResponse({ status: 200, description: 'Weekly trends retrieved successfully' })
  getWeeklyTrends() {
    return this.statisticsService.getWeeklyTrends();
  }

  @Get('activity-heatmap')
  @Permissions('view')
  @ApiOperation({ summary: 'Get scan activity heatmap data' })
  @ApiResponse({ status: 200, description: 'Activity heatmap retrieved successfully' })
  getScanActivityHeatmap() {
    return this.statisticsService.getScanActivityHeatmap();
  }

  @Get('locations')
  @Permissions('view')
  @ApiOperation({ summary: 'Get location-based statistics' })
  @ApiResponse({ status: 200, description: 'Location statistics retrieved successfully' })
  getLocationStats() {
    return this.statisticsService.getLocationStats();
  }

  @Get('user-activity')
  @Permissions('view')
  @ApiOperation({ summary: 'Get user activity statistics' })
  @ApiResponse({ status: 200, description: 'User activity statistics retrieved successfully' })
  getUserActivityStats() {
    return this.statisticsService.getUserActivityStats();
  }

  @Get('exports')
  @Permissions('view')
  @ApiOperation({ summary: 'Get export statistics' })
  @ApiResponse({ status: 200, description: 'Export statistics retrieved successfully' })
  getExportStats() {
    return this.statisticsService.getExportStats();
  }
}