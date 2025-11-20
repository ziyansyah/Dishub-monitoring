import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehiclesDto } from './dto/query-vehicles.dto';
export declare class VehiclesController {
    private readonly vehiclesService;
    constructor(vehiclesService: VehiclesService);
    create(createVehicleDto: CreateVehicleDto): Promise<{
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
    }>;
    findAll(query: QueryVehiclesDto): Promise<{
        data: ({
            scans: {
                scanTime: Date;
                location: string;
            }[];
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
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getStats(): Promise<{
        totalVehicles: number;
        taxActive: number;
        taxInactive: number;
        vehiclesByType: {
            type: string;
            count: number;
        }[];
        recentScans: ({
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
    }>;
    getTaxExpirySoon(): Promise<{
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
    }[]>;
    findByPlateNumber(plateNumber: string): Promise<{
        scans: {
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
        }[];
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
    }>;
    findOne(id: string): Promise<{
        scans: ({
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
    }>;
    update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<{
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
    }>;
    updateTaxStatus(id: string, body: {
        taxStatus: string;
        taxExpiryDate?: string;
    }): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
