import { PrismaService } from '../database/prisma.service';
import { GenerateReportDto } from './dto/generate-report.dto';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    generateReport(generateReportDto: GenerateReportDto, userId: string): Promise<{
        reportId: string;
        downloadUrl: string;
        status: string;
    }>;
    findAll(userId: string): Promise<({
        generator: {
            username: string;
            name: string;
            id: string;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        startDate: Date;
        endDate: Date;
        filterType: string;
        filePath: string | null;
        fileFormat: string;
        generatedBy: string;
    })[]>;
    findOne(id: string, userId: string): Promise<{
        generator: {
            username: string;
            name: string;
            id: string;
        };
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        startDate: Date;
        endDate: Date;
        filterType: string;
        filePath: string | null;
        fileFormat: string;
        generatedBy: string;
    }>;
    downloadReport(id: string, userId: string): Promise<string>;
    deleteReport(id: string, userId: string): Promise<{
        message: string;
    }>;
    private generateFile;
    private generateExcelReport;
    private generatePDFReport;
    private getReportData;
    private getVehicleData;
    private getScanHistory;
    private getTaxComplianceData;
    private getActivityLogsData;
    getReportStats(): Promise<{
        totalReports: number;
        reportsLast30Days: number;
        successfulReports: number;
        pendingReports: number;
        successRate: number;
    }>;
}
