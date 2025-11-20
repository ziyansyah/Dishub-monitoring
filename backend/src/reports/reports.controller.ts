import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard, Permissions } from '../auth/guards/permissions.guard';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  @Permissions('export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a new report' })
  @ApiResponse({ status: 200, description: 'Report generation started' })
  @ApiResponse({ status: 400, description: 'Invalid report parameters' })
  async generate(
    @Body() generateReportDto: GenerateReportDto,
    @Request() req,
  ) {
    return this.reportsService.generateReport(generateReportDto, req.user.id);
  }

  @Get()
  @Permissions('view')
  @ApiOperation({ summary: 'Get all reports for current user' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async findAll(@Request() req) {
    return this.reportsService.findAll(req.user.id);
  }

  @Get(':id')
  @Permissions('view')
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.reportsService.findOne(id, req.user.id);
  }

  @Get(':id/download')
  @Permissions('export')
  @ApiOperation({ summary: 'Download generated report' })
  @ApiResponse({ status: 200, description: 'Report downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 400, description: 'Report not ready for download' })
  async download(
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response,
  ) {
    try {
      const filePath = await this.reportsService.downloadReport(id, req.user.id);

      // Get file info
      const fs = require('fs');
      const path = require('path');
      const report = await this.reportsService.findOne(id, req.user.id);

      res.setHeader('Content-Type', this.getContentType(report.fileFormat));
      res.setHeader('Content-Disposition', `attachment; filename="${report.title}.${report.fileFormat}"`);

      // Stream file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  @Delete(':id')
  @Permissions('delete')
  @ApiOperation({ summary: 'Delete report' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.reportsService.deleteReport(id, req.user.id);
  }

  @Get('stats/summary')
  @Permissions('view')
  @ApiOperation({ summary: 'Get report statistics' })
  @ApiResponse({ status: 200, description: 'Report statistics retrieved successfully' })
  getStats() {
    return this.reportsService.getReportStats();
  }

  private getContentType(format: string): string {
    switch (format) {
      case 'pdf':
        return 'application/pdf';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'csv':
        return 'text/csv';
      default:
        return 'application/octet-stream';
    }
  }
}