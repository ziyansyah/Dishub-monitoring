import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/profile.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any, res: any, loginDto: LoginDto, ip: string, userAgent: string): Promise<void>;
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
    logout(req: any, res: any, ip: string, userAgent: string): Promise<void>;
    getProfile(req: any): Promise<{
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
    updateProfile(req: any, updateProfileDto: UpdateProfileDto, ip: string, userAgent: string): Promise<{
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
}
