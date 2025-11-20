import { ScansService } from './scans.service';
import { CreateScanDto } from './dto/create-scan.dto';
import { QueryScansDto } from './dto/query-scans.dto';
export declare class ScansController {
    private readonly scansService;
    constructor(scansService: ScansService);
    create(createScanDto: CreateScanDto, req: any, ip: string, userAgent: string): Promise<{
        user: {
            username: string;
            name: string;
            id: string;
        };
    } & {
        id: string;
        ipAddress: string | null;
        userAgent: string | null;
        userId: string;
        plateNumber: string;
        vehicleType: string;
        color: string;
        ownerName: string;
        taxStatus: string;
        scanTime: Date;
        location: string | null;
        vehicleId: string | null;
    }>;
    findAll(query: QueryScansDto): Promise<{
        data: ({
            user: {
                username: string;
                name: string;
                id: string;
            };
            vehicle: {
                id: string;
                plateNumber: string;
                taxStatus: string;
                taxExpiryDate: Date;
            };
        } & {
            id: string;
            ipAddress: string | null;
            userAgent: string | null;
            userId: string;
            plateNumber: string;
            vehicleType: string;
            color: string;
            ownerName: string;
            taxStatus: string;
            scanTime: Date;
            location: string | null;
            vehicleId: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    findRecent(limit?: string): Promise<({
        user: {
            username: string;
            name: string;
            id: string;
        };
        vehicle: {
            id: string;
            plateNumber: string;
            taxStatus: string;
            taxExpiryDate: Date;
        };
    } & {
        id: string;
        ipAddress: string | null;
        userAgent: string | null;
        userId: string;
        plateNumber: string;
        vehicleType: string;
        color: string;
        ownerName: string;
        taxStatus: string;
        scanTime: Date;
        location: string | null;
        vehicleId: string | null;
    })[]>;
    getHistory(query: QueryScansDto): Promise<{
        data: ({
            user: {
                username: string;
                name: string;
                id: string;
            };
        } & {
            id: string;
            ipAddress: string | null;
            userAgent: string | null;
            userId: string;
            plateNumber: string;
            vehicleType: string;
            color: string;
            ownerName: string;
            taxStatus: string;
            scanTime: Date;
            location: string | null;
            vehicleId: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
        period: {
            filter: string;
            startDate: Date;
            endDate: Date;
        };
    }>;
    getStats(): Promise<{
        totalScans: number;
        scansToday: number;
        uniqueVehiclesScanned: number;
        taxActiveScans: number;
        taxInactiveScans: number;
        weeklyTrend: any[];
        vehicleTypeDistribution: {
            type: string;
            count: number;
        }[];
    }>;
    getLocations(): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.ScanGroupByOutputType, "location"[]> & {
        _count: {
            location: number;
        };
    })[]>;
    getTopScannedVehicles(limit?: string): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.ScanGroupByOutputType, "plateNumber"[]> & {
        _count: {
            plateNumber: number;
        };
    })[]>;
    findOne(id: string): Promise<{
        user: {
            role: {
                name: string;
            };
            username: string;
            name: string;
            id: string;
        };
        vehicle: {
            _count: {
                scans: number;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            plateNumber: string;
            vehicleType: string;
            color: string;
            ownerName: string;
            taxStatus: string;
            taxExpiryDate: Date | null;
        };
    } & {
        id: string;
        ipAddress: string | null;
        userAgent: string | null;
        userId: string;
        plateNumber: string;
        vehicleType: string;
        color: string;
        ownerName: string;
        taxStatus: string;
        scanTime: Date;
        location: string | null;
        vehicleId: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
