import { SearchDto } from '../../common/dto/pagination.dto';
export declare class QueryUsersDto extends SearchDto {
    roleId?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
