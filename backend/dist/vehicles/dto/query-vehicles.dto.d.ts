import { SearchDto } from '../../common/dto/pagination.dto';
export declare class QueryVehiclesDto extends SearchDto {
    type?: string;
    taxStatus?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
