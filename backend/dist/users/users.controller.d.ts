import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        role: {
            description: string;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            canView: boolean;
            canEdit: boolean;
            canExport: boolean;
            canDelete: boolean;
        };
        username: string;
        email: string;
        name: string;
        roleId: string;
        avatar: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(query: QueryUsersDto): Promise<{
        data: {
            role: {
                description: string;
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                canView: boolean;
                canEdit: boolean;
                canExport: boolean;
                canDelete: boolean;
            };
            _count: {
                scans: number;
                activities: number;
            };
            username: string;
            email: string;
            name: string;
            roleId: string;
            avatar: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getStats(): Promise<{
        totalUsers: number;
        usersByRole: {
            roleName: string;
            userCount: number;
        }[];
        recentUsers: {
            role: {
                name: string;
            };
            username: string;
            email: string;
            name: string;
            id: string;
            createdAt: Date;
        }[];
    }>;
    findOne(id: string): Promise<{
        role: {
            description: string;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            canView: boolean;
            canEdit: boolean;
            canExport: boolean;
            canDelete: boolean;
        };
        _count: {
            scans: number;
            activities: number;
            generatedReports: number;
        };
        username: string;
        email: string;
        name: string;
        roleId: string;
        avatar: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        role: {
            description: string;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            canView: boolean;
            canEdit: boolean;
            canExport: boolean;
            canDelete: boolean;
        };
        username: string;
        email: string;
        name: string;
        roleId: string;
        avatar: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    toggleActive(id: string): Promise<{
        role: {
            description: string;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            canView: boolean;
            canEdit: boolean;
            canExport: boolean;
            canDelete: boolean;
        };
    } & {
        username: string;
        password: string;
        email: string;
        name: string;
        roleId: string;
        avatar: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        role: {
            description: string;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            canView: boolean;
            canEdit: boolean;
            canExport: boolean;
            canDelete: boolean;
        };
    } & {
        username: string;
        password: string;
        email: string;
        name: string;
        roleId: string;
        avatar: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
