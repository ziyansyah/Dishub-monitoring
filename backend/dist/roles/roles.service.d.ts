import { PrismaService } from '../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createRoleDto: CreateRoleDto): Promise<{
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
    }>;
    findAll(): Promise<({
        _count: {
            users: number;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            users: number;
        };
    } & {
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
    }>;
    update(id: string, updateRoleDto: UpdateRoleDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    findByName(name: string): Promise<{
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
    }>;
    getRoleStats(): Promise<{
        totalRoles: number;
        roles: {
            id: string;
            name: string;
            description: string;
            userCount: number;
            permissions: {
                canView: boolean;
                canEdit: boolean;
                canExport: boolean;
                canDelete: boolean;
            };
        }[];
    }>;
}
