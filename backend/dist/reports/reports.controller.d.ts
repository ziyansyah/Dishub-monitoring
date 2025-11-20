import { Response } from 'express';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    generate(generateReportDto: GenerateReportDto, req: any): Promise<{
        reportId: string;
        downloadUrl: string;
        status: string;
    }>;
    findAll(req: any): Promise<({
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
    findOne(id: string, req: any): Promise<{
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
    download(id: string, req: any, res: Response): Promise<void>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    getStats(): Promise<{
        totalReports: number;
        reportsLast30Days: number;
        successfulReports: number;
        pendingReports: number;
        successRate: number;
    }>;
    private getContentType;
}
