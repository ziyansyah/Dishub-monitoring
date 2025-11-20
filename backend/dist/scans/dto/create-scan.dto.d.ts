export declare class CreateScanDto {
    plateNumber: string;
    vehicleType: string;
    color: string;
    ownerName?: string;
    taxStatus?: string;
    location?: string;
    metadata?: {
        cameraId?: string;
        confidence?: number;
        imageUrl?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
}
