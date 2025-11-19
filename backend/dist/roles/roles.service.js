"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let RolesService = class RolesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRoleDto) {
        const { name, description, canView, canEdit, canExport, canDelete } = createRoleDto;
        const existingRole = await this.prisma.role.findUnique({
            where: { name },
        });
        if (existingRole) {
            throw new common_1.ConflictException('Role with this name already exists');
        }
        return this.prisma.role.create({
            data: {
                name,
                description,
                canView: canView ?? true,
                canEdit: canEdit ?? false,
                canExport: canExport ?? false,
                canDelete: canDelete ?? false,
            },
        });
    }
    async findAll() {
        return this.prisma.role.findMany({
            where: {
                isActive: true,
            },
            include: {
                _count: {
                    select: {
                        users: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
    async findOne(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        return role;
    }
    async update(id, updateRoleDto) {
        const existingRole = await this.prisma.role.findUnique({
            where: { id },
        });
        if (!existingRole) {
            throw new common_1.NotFoundException('Role not found');
        }
        if (updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
            const nameConflict = await this.prisma.role.findUnique({
                where: { name: updateRoleDto.name },
            });
            if (nameConflict) {
                throw new common_1.ConflictException('Role with this name already exists');
            }
        }
        return this.prisma.role.update({
            where: { id },
            data: updateRoleDto,
        });
    }
    async remove(id) {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        });
        if (!role) {
            throw new common_1.NotFoundException('Role not found');
        }
        if (role._count.users > 0) {
            throw new common_1.BadRequestException('Cannot delete role that is being used by users');
        }
        return this.prisma.role.update({
            where: { id },
            data: {
                isActive: false,
            },
        });
    }
    async findByName(name) {
        return this.prisma.role.findUnique({
            where: { name },
        });
    }
    async getRoleStats() {
        const totalRoles = await this.prisma.role.count({
            where: { isActive: true },
        });
        const rolesWithUserCount = await this.prisma.role.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: {
                        users: true,
                    },
                },
            },
        });
        return {
            totalRoles,
            roles: rolesWithUserCount.map(role => ({
                id: role.id,
                name: role.name,
                description: role.description,
                userCount: role._count.users,
                permissions: {
                    canView: role.canView,
                    canEdit: role.canEdit,
                    canExport: role.canExport,
                    canDelete: role.canDelete,
                },
            })),
        };
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map