import { SearchDto } from '../../common/dto/pagination.dto';
export declare class QueryScansDto extends SearchDto {
    filter?: string;
    vehicleType?: string;
    taxStatus?: string;
    userId?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
