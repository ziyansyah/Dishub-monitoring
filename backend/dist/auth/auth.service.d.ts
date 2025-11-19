import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/profile.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    login(loginDto: LoginDto, ip: string, userAgent: string): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
            email: string;
            name: string;
            avatar: string;
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
        };
        expires_in: string;
    }>;
    register(registerDto: RegisterDto, ip: string, userAgent: string): Promise<{
        id: string;
        username: string;
        email: string;
        name: string;
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
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        username: string;
        email: string;
        name: string;
        avatar: string;
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
        isActive: boolean;
        createdAt: Date;
    }>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto, ip: string, userAgent: string): Promise<{
        id: string;
        username: string;
        email: string;
        name: string;
        avatar: string;
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
        isActive: boolean;
    }>;
    logout(userId: string, ip: string, userAgent: string): Promise<{
        message: string;
    }>;
    private logActivityByUser;
    private logActivity;
}
