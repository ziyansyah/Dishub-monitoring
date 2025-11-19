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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../database/prisma.service");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(loginDto, ip, userAgent) {
        const { username, password } = loginDto;
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email: username },
                ],
            },
            include: {
                role: true,
            },
        });
        if (!user) {
            await this.logActivity('Login', ip, userAgent, 'failed', `Username: ${username}`);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            await this.logActivity('Login', ip, userAgent, 'failed', `Inactive user: ${username}`);
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            await this.logActivityByUser('Login', user.id, ip, userAgent, 'failed', 'Invalid password');
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email,
        };
        const token = this.jwtService.sign(payload);
        await this.logActivityByUser('Login', user.id, ip, userAgent, 'success', 'User logged in successfully');
        return {
            access_token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                role: user.role,
            },
            expires_in: this.configService.get('JWT_EXPIRES_IN') || '1h',
        };
    }
    async register(registerDto, ip, userAgent) {
        const { email, username, name, password, roleId } = registerDto;
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username },
                ],
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email or username already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        let role = null;
        if (roleId) {
            role = await this.prisma.role.findUnique({ where: { id: roleId } });
            if (!role) {
                throw new common_1.BadRequestException('Invalid role ID');
            }
        }
        else {
            role = await this.prisma.role.findFirst({ where: { name: 'Viewer' } });
            if (!role) {
                throw new common_1.BadRequestException('Default role not found');
            }
        }
        const user = await this.prisma.user.create({
            data: {
                email,
                username,
                name,
                password: hashedPassword,
                roleId: role.id,
            },
            include: {
                role: true,
            },
        });
        await this.logActivityByUser('Register', user.id, ip, userAgent, 'success', 'User registered successfully');
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
        };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                role: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
        };
    }
    async updateProfile(userId, updateProfileDto, ip, userAgent) {
        const { email, name, avatar, currentPassword, newPassword } = updateProfileDto;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const updateData = {};
        if (email && email !== user.email) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Email already in use');
            }
            updateData.email = email;
        }
        if (name) {
            updateData.name = name;
        }
        if (avatar) {
            updateData.avatar = avatar;
        }
        if (newPassword) {
            if (!currentPassword) {
                throw new common_1.BadRequestException('Current password is required to change password');
            }
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new common_1.BadRequestException('Current password is incorrect');
            }
            updateData.password = await bcrypt.hash(newPassword, 10);
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: {
                role: true,
            },
        });
        await this.logActivityByUser('Update Profile', userId, ip, userAgent, 'success', 'Profile updated successfully');
        return {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            name: updatedUser.name,
            avatar: updatedUser.avatar,
            role: updatedUser.role,
            isActive: updatedUser.isActive,
        };
    }
    async logout(userId, ip, userAgent) {
        await this.logActivityByUser('Logout', userId, ip, userAgent, 'success', 'User logged out successfully');
        return { message: 'Logout successful' };
    }
    async logActivityByUser(action, userId, ip, userAgent, status, details) {
        try {
            await this.prisma.activityLog.create({
                data: {
                    action,
                    userId,
                    ipAddress: ip,
                    userAgent,
                    status,
                    details,
                },
            });
        }
        catch (error) {
            console.error('Failed to log activity:', error);
        }
    }
    async logActivity(action, ip, userAgent, status, details) {
        try {
            await this.prisma.activityLog.create({
                data: {
                    action,
                    userId: 'system',
                    ipAddress: ip,
                    userAgent,
                    status,
                    details,
                },
            });
        }
        catch (error) {
            console.error('Failed to log activity:', error);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map