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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const ExcelJS = require("exceljs");
const pdfkit_1 = require("pdfkit");
const fs = require("fs");
const path = require("path");
const date_fns_1 = require("date-fns");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateReport(generateReportDto, userId) {
        const { title, startDate, endDate, taxStatus, format, type } = generateReportDto;
        const start = (0, date_fns_1.parseISO)(startDate);
        const end = (0, date_fns_1.parseISO)(endDate);
        if (!(0, date_fns_1.isValid)(start) || !(0, date_fns_1.isValid)(end)) {
            throw new common_1.BadRequestException('Invalid date format');
        }
        if (start > end) {
            throw new common_1.BadRequestException('Start date must be before end date');
        }
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
            const filePath = await this.generateFile(report.id, generateReportDto);
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
        }
        catch (error) {
            await this.prisma.report.update({
                where: { id: report.id },
                data: {
                    status: 'failed',
                },
            });
            throw new common_1.BadRequestException(`Failed to generate report: ${error.message}`);
        }
    }
    async findAll(userId) {
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
    async findOne(id, userId) {
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
            throw new common_1.NotFoundException('Report not found');
        }
        return report;
    }
    async downloadReport(id, userId) {
        const report = await this.findOne(id, userId);
        if (report.status !== 'completed' || !report.filePath) {
            throw new common_1.BadRequestException('Report is not ready for download');
        }
        const fullPath = path.join(process.cwd(), report.filePath);
        if (!fs.existsSync(fullPath)) {
            throw new common_1.NotFoundException('Report file not found');
        }
        return fullPath;
    }
    async deleteReport(id, userId) {
        const report = await this.findOne(id, userId);
        if (report.filePath) {
            const fullPath = path.join(process.cwd(), report.filePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        }
        await this.prisma.report.delete({
            where: { id },
        });
        return { message: 'Report deleted successfully' };
    }
    async generateFile(reportId, dto) {
        const { format, type, startDate, endDate, taxStatus, title } = dto;
        const uploadsDir = path.join(process.cwd(), 'exports');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.${format}`;
        const filePath = path.join('exports', fileName);
        if (format === 'excel') {
            return this.generateExcelReport(filePath, dto);
        }
        else if (format === 'pdf') {
            return this.generatePDFReport(filePath, dto);
        }
        else {
            throw new common_1.BadRequestException('Unsupported format');
        }
    }
    async generateExcelReport(filePath, dto) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report Data');
        const data = await this.getReportData(dto);
        const headers = Object.keys(data[0] || {});
        worksheet.addRow(headers);
        data.forEach(row => {
            worksheet.addRow(Object.values(row));
        });
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        worksheet.columns.forEach(column => {
            if (column.header) {
                column.width = Math.max(column.header.length, 15);
            }
        });
        await workbook.xlsx.writeFile(path.join(process.cwd(), filePath));
        return filePath;
    }
    async generatePDFReport(filePath, dto) {
        const data = await this.getReportData(dto);
        const doc = new pdfkit_1.default();
        const stream = fs.createWriteStream(path.join(process.cwd(), filePath));
        doc.pipe(stream);
        doc.fontSize(20).text(dto.title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Period: ${dto.startDate} to ${dto.endDate}`);
        doc.text(`Filter: ${dto.taxStatus}`);
        doc.text(`Generated: ${new Date().toLocaleString()}`);
        doc.moveDown();
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
        }
        else {
            doc.text('No data found for the selected criteria.');
        }
        doc.end();
        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve(filePath));
            stream.on('error', reject);
        });
    }
    async getReportData(dto) {
        const { type, startDate, endDate, taxStatus } = dto;
        const start = (0, date_fns_1.parseISO)(startDate);
        const end = (0, date_fns_1.parseISO)(endDate);
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
    async getVehicleData(startDate, endDate, taxStatus) {
        const where = {
            isActive: true,
        };
        if (taxStatus === 'lunas') {
            where.taxStatus = 'Aktif';
        }
        else if (taxStatus === 'belum-lunas') {
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
            'Tax Expiry Date': vehicle.taxExpiryDate ? (0, date_fns_1.format)(vehicle.taxExpiryDate, 'yyyy-MM-dd') : 'N/A',
            'Scans Count': vehicle._count.scans,
            'Created Date': (0, date_fns_1.format)(vehicle.createdAt, 'yyyy-MM-dd'),
        }));
    }
    async getScanHistory(startDate, endDate, taxStatus) {
        const where = {
            scanTime: {
                gte: startDate,
                lte: endDate,
            },
        };
        if (taxStatus === 'lunas') {
            where.taxStatus = 'Aktif';
        }
        else if (taxStatus === 'belum-lunas') {
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
            'Scan Time': (0, date_fns_1.format)(scan.scanTime, 'yyyy-MM-dd HH:mm:ss'),
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
    async getTaxComplianceData(startDate, endDate, taxStatus) {
        const where = {
            isActive: true,
        };
        if (taxStatus === 'lunas') {
            where.taxStatus = 'Aktif';
        }
        else if (taxStatus === 'belum-lunas') {
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
            'Tax Expiry Date': vehicle.taxExpiryDate ? (0, date_fns_1.format)(vehicle.taxExpiryDate, 'yyyy-MM-dd') : 'N/A',
            'Days Until Expiry': vehicle.taxExpiryDate ?
                Math.ceil((vehicle.taxExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 'N/A',
            'Last Scan Date': vehicle.scans.length > 0 ?
                (0, date_fns_1.format)(vehicle.scans[vehicle.scans.length - 1].scanTime, 'yyyy-MM-dd HH:mm:ss') : 'Never',
            'Total Scans': vehicle.scans.length,
        }));
    }
    async getActivityLogsData(startDate, endDate, taxStatus) {
        const where = {
            timestamp: {
                gte: startDate,
                lte: endDate,
            },
        };
        if (taxStatus === 'lunas') {
            where.action = 'success';
        }
        else if (taxStatus === 'belum-lunas') {
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
            'Timestamp': (0, date_fns_1.format)(activity.timestamp, 'yyyy-MM-dd HH:mm:ss'),
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
        const [totalReports, reportsLast30Days, successfulReports, pendingReports,] = await Promise.all([
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
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map