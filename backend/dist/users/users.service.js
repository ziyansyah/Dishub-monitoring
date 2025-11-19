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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const { email, username, name, password, roleId, avatar } = createUserDto;
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username },
                ],
            },
        });
        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            throw new common_1.ConflictException(`User with this ${field} already exists`);
        }
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
        });
        if (!role || !role.isActive) {
            throw new common_1.BadRequestException('Invalid or inactive role');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                username,
                name,
                password: hashedPassword,
                roleId,
                avatar,
            },
            include: {
                role: true,
            },
        });
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, roleId, isActive, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { username: { contains: search } },
                { email: { contains: search } },
            ];
        }
        if (roleId) {
            where.roleId = roleId;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
                include: {
                    role: true,
                    _count: {
                        select: {
                            scans: true,
                            activities: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        const usersWithoutPasswords = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
        return {
            data: usersWithoutPasswords,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
                _count: {
                    select: {
                        scans: true,
                        activities: true,
                        generatedReports: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async update(id, updateUserDto) {
        const { email, username, password, roleId, ...otherData } = updateUserDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException('User not found');
        }
        if (email || username) {
            const conflictUser = await this.prisma.user.findFirst({
                where: {
                    AND: [
                        { id: { not: id } },
                        {
                            OR: [
                                ...(email ? [{ email }] : []),
                                ...(username ? [{ username }] : []),
                            ],
                        },
                    ],
                },
            });
            if (conflictUser) {
                const field = conflictUser.email === email ? 'email' : 'username';
                throw new common_1.ConflictException(`User with this ${field} already exists`);
            }
        }
        if (roleId) {
            const role = await this.prisma.role.findUnique({
                where: { id: roleId },
            });
            if (!role || !role.isActive) {
                throw new common_1.BadRequestException('Invalid or inactive role');
            }
        }
        const updateData = { ...otherData };
        if (email)
            updateData.email = email;
        if (username)
            updateData.username = username;
        if (roleId)
            updateData.roleId = roleId;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                role: true,
            },
        });
        const { password: _, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
    async remove(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        scans: true,
                        generatedReports: true,
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user._count.scans > 0 || user._count.generatedReports > 0) {
            throw new common_1.BadRequestException('Cannot delete user with associated data. Consider deactivating instead.');
        }
        return this.prisma.user.update({
            where: { id },
            data: {
                isActive: false,
            },
            include: {
                role: true,
            },
        });
    }
    async getUserStats() {
        const totalUsers = await this.prisma.user.count({
            where: { isActive: true },
        });
        const usersByRole = await this.prisma.role.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: {
                        users: {
                            where: { isActive: true },
                        },
                    },
                },
            },
        });
        const recentUsers = await this.prisma.user.findMany({
            where: { isActive: true },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                role: true,
            },
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                createdAt: true,
                role: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        return {
            totalUsers,
            usersByRole: usersByRole.map(role => ({
                roleName: role.name,
                userCount: role._count.users,
            })),
            recentUsers,
        };
    }
    async toggleActiveStatus(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.prisma.user.update({
            where: { id },
            data: {
                isActive: !user.isActive,
            },
            include: {
                role: true,
            },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map