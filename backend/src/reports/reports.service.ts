import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { format, parseISO, isValid } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateReport(generateReportDto: GenerateReportDto, userId: string) {
    const { title, startDate, endDate, taxStatus, format, type } = generateReportDto;

    // Validate date range
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (!isValid(start) || !isValid(end)) {
      throw new BadRequestException('Invalid date format');
    }

    if (start > end) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Create report record
    const report = await this.prisma.report.create({
      data: {
        title,
        startDate: start,
        endDate: end,
        filterType: taxStatus,
        fileFormat: format,
        status: 'generating',
        generatedBy: userId,
      },
    });

    try {
      // Generate file
      const filePath = await this.generateFile(report.id, generateReportDto);

      // Update report record
      await this.prisma.report.update({
        where: { id: report.id },
        data: {
          filePath,
          status: 'completed',
        },
      });

      return {
        reportId: report.id,
        downloadUrl: `/api/reports/${report.id}/download`,
        status: 'completed',
      };
    } catch (error) {
      // Update report record with failed status
      await this.prisma.report.update({
        where: { id: report.id },
        data: {
          status: 'failed',
        },
      });

      throw new BadRequestException(`Failed to generate report: ${error.message}`);
    }
  }

  async findAll(userId: string) {
    const reports = await this.prisma.report.findMany({
      where: { generatedBy: userId },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        generator: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    return reports;
  }

  async findOne(id: string, userId: string) {
    const report = await this.prisma.report.findFirst({
      where: {
        id,
        generatedBy: userId,
      },
      include: {
        generator: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async downloadReport(id: string, userId: string) {
    const report = await this.findOne(id, userId);

    if (report.status !== 'completed' || !report.filePath) {
      throw new BadRequestException('Report is not ready for download');
    }

    const fullPath = path.join(process.cwd(), report.filePath);

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('Report file not found');
    }

    return fullPath;
  }

  async deleteReport(id: string, userId: string) {
    const report = await this.findOne(id, userId);

    // Delete file if exists
    if (report.filePath) {
      const fullPath = path.join(process.cwd(), report.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Delete report record
    await this.prisma.report.delete({
      where: { id },
    });

    return { message: 'Report deleted successfully' };
  }

  private async generateFile(reportId: string, dto: GenerateReportDto): Promise<string> {
    const { format, type, startDate, endDate, taxStatus, title } = dto;
    const uploadsDir = path.join(process.cwd(), 'exports');

    // Ensure exports directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.${format}`;
    const filePath = path.join('exports', fileName);

    if (format === 'excel') {
      return this.generateExcelReport(filePath, dto);
    } else if (format === 'pdf') {
      return this.generatePDFReport(filePath, dto);
    } else {
      throw new BadRequestException('Unsupported format');
    }
  }

  private async generateExcelReport(filePath: string, dto: GenerateReportDto): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report Data');

    // Get data based on report type
    const data = await this.getReportData(dto);

    // Add headers
    const headers = Object.keys(data[0] || {});
    worksheet.addRow(headers);

    // Add data
    data.forEach(row => {
      worksheet.addRow(Object.values(row));
    });

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      if (column.header) {
        column.width = Math.max(column.header.length, 15);
      }
    });

    // Save file
    await workbook.xlsx.writeFile(path.join(process.cwd(), filePath));

    return filePath;
  }

  private async generatePDFReport(filePath: string, dto: GenerateReportDto): Promise<string> {
    const data = await this.getReportData(dto);
    const doc = new PDFDocument();

    const stream = fs.createWriteStream(path.join(process.cwd(), filePath));
    doc.pipe(stream);

    // Add content to PDF
    doc.fontSize(20).text(dto.title, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Period: ${dto.startDate} to ${dto.endDate}`);
    doc.text(`Filter: ${dto.taxStatus}`);
    doc.text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Add table headers
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      doc.fontSize(10).font('Helvetica-Bold');
      headers.forEach((header, index) => {
        doc.text(header, { continued: index < headers.length - 1 });
        if (index < headers.length - 1) {
          doc.text(' | ', { continued: true });
        }
      });
      doc.moveDown();

      // Add data rows
      doc.font('Helvetica');
      data.forEach(row => {
        const values = Object.values(row);
        values.forEach((value, index) => {
          doc.text(String(value), { continued: index < values.length - 1 });
          if (index < values.length - 1) {
            doc.text(' | ', { continued: true });
          }
        });
        doc.moveDown();
      });
    } else {
      doc.text('No data found for the selected criteria.');
    }

    // Finalize PDF
    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  private async getReportData(dto: GenerateReportDto): Promise<any[]> {
    const { type, startDate, endDate, taxStatus } = dto;
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    switch (type) {
      case 'vehicle-data':
        return this.getVehicleData(start, end, taxStatus);
      case 'scan-history':
        return this.getScanHistory(start, end, taxStatus);
      case 'tax-compliance':
        return this.getTaxComplianceData(start, end, taxStatus);
      case 'activity-logs':
        return this.getActivityLogsData(start, end, taxStatus);
      default:
        return this.getVehicleData(start, end, taxStatus);
    }
  }

  private async getVehicleData(startDate: Date, endDate: Date, taxStatus: string): Promise<any[]> {
    const where: any = {
      isActive: true,
    };

    if (taxStatus === 'lunas') {
      where.taxStatus = 'Aktif';
    } else if (taxStatus === 'belum-lunas') {
      where.taxStatus = 'Mati';
    }

    const vehicles = await this.prisma.vehicle.findMany({
      where,
      include: {
        _count: {
          select: {
            scans: {
              where: {
                scanTime: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return vehicles.map(vehicle => ({
      'Plate Number': vehicle.plateNumber,
      'Vehicle Type': vehicle.vehicleType,
      'Color': vehicle.color,
      'Owner Name': vehicle.ownerName,
      'Tax Status': vehicle.taxStatus,
      'Tax Expiry Date': vehicle.taxExpiryDate ? format(vehicle.taxExpiryDate, 'yyyy-MM-dd') : 'N/A',
      'Scans Count': vehicle._count.scans,
      'Created Date': format(vehicle.createdAt, 'yyyy-MM-dd'),
    }));
  }

  private async getScanHistory(startDate: Date, endDate: Date, taxStatus: string): Promise<any[]> {
    const where: any = {
      scanTime: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (taxStatus === 'lunas') {
      where.taxStatus = 'Aktif';
    } else if (taxStatus === 'belum-lunas') {
      where.taxStatus = 'Mati';
    }

    const scans = await this.prisma.scan.findMany({
      where,
      include: {
        user: {
          select: {
            username: true,
            name: true,
          },
        },
      },
      orderBy: {
        scanTime: 'desc',
      },
    });

    return scans.map(scan => ({
      'Scan Time': format(scan.scanTime, 'yyyy-MM-dd HH:mm:ss'),
      'Plate Number': scan.plateNumber,
      'Vehicle Type': scan.vehicleType,
      'Color': scan.color,
      'Owner Name': scan.ownerName,
      'Tax Status': scan.taxStatus,
      'Location': scan.location,
      'Scanned By': scan.user?.name || 'Unknown',
      'IP Address': scan.ipAddress || 'N/A',
    }));
  }

  private async getTaxComplianceData(startDate: Date, endDate: Date, taxStatus: string): Promise<any[]> {
    const where: any = {
      isActive: true,
    };

    if (taxStatus === 'lunas') {
      where.taxStatus = 'Aktif';
    } else if (taxStatus === 'belum-lunas') {
      where.taxStatus = 'Mati';
    }

    const vehicles = await this.prisma.vehicle.findMany({
      where,
      include: {
        scans: {
          where: {
            scanTime: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            scanTime: true,
          },
        },
      },
    });

    return vehicles.map(vehicle => ({
      'Plate Number': vehicle.plateNumber,
      'Owner Name': vehicle.ownerName,
      'Vehicle Type': vehicle.vehicleType,
      'Current Tax Status': vehicle.taxStatus,
      'Tax Expiry Date': vehicle.taxExpiryDate ? format(vehicle.taxExpiryDate, 'yyyy-MM-dd') : 'N/A',
      'Days Until Expiry': vehicle.taxExpiryDate ?
        Math.ceil((vehicle.taxExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 'N/A',
      'Last Scan Date': vehicle.scans.length > 0 ?
        format(vehicle.scans[vehicle.scans.length - 1].scanTime, 'yyyy-MM-dd HH:mm:ss') : 'Never',
      'Total Scans': vehicle.scans.length,
    }));
  }

  private async getActivityLogsData(startDate: Date, endDate: Date, taxStatus: string): Promise<any[]> {
    const where: any = {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (taxStatus === 'lunas') {
      where.action = 'success';
    } else if (taxStatus === 'belum-lunas') {
      where.action = 'failed';
    }

    const activities = await this.prisma.activityLog.findMany({
      where,
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
      orderBy: {
        timestamp: 'desc',
      },
    });

    return activities.map(activity => ({
      'Timestamp': format(activity.timestamp, 'yyyy-MM-dd HH:mm:ss'),
      'User': activity.user?.name || 'System',
      'Username': activity.user?.username || 'system',
      'Role': activity.user?.role?.name || 'System',
      'Action': activity.action,
      'Status': activity.status,
      'IP Address': activity.ipAddress || 'N/A',
      'Details': activity.details || '',
    }));
  }

  async getReportStats() {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalReports,
      reportsLast30Days,
      successfulReports,
      pendingReports,
    ] = await Promise.all([
      this.prisma.report.count(),
      this.prisma.report.count({
        where: {
          createdAt: {
            gte: last30Days,
          },
        },
      }),
      this.prisma.report.count({
        where: {
          status: 'completed',
        },
      }),
      this.prisma.report.count({
        where: {
          status: 'generating',
        },
      }),
    ]);

    return {
      totalReports,
      reportsLast30Days,
      successfulReports,
      pendingReports,
      successRate: totalReports > 0 ? Math.round((successfulReports / totalReports) * 100) : 0,
    };
  }
}