import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, ip: string, userAgent: string) {
    const { username, password } = loginDto;

    // Find user by username or email
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
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      await this.logActivity('Login', ip, userAgent, 'failed', `Inactive user: ${username}`);
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.logActivityByUser('Login', user.id, ip, userAgent, 'failed', 'Invalid password');
      throw new UnauthorizedException('Invalid credentials');
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
      expires_in: this.configService.get<string>('JWT_EXPIRES_IN') || '1h',
    };
  }

  async register(registerDto: RegisterDto, ip: string, userAgent: string) {
    const { email, username, name, password, roleId } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get default role if not provided
    let role = null;
    if (roleId) {
      role = await this.prisma.role.findUnique({ where: { id: roleId } });
      if (!role) {
        throw new BadRequestException('Invalid role ID');
      }
    } else {
      // Get Viewer role as default
      role = await this.prisma.role.findFirst({ where: { name: 'Viewer' } });
      if (!role) {
        throw new BadRequestException('Default role not found');
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

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
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

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto, ip: string, userAgent: string) {
    const { email, name, avatar, currentPassword, newPassword } = updateProfileDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const updateData: any = {};

    if (email && email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use');
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
        throw new BadRequestException('Current password is required to change password');
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
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

  async logout(userId: string, ip: string, userAgent: string) {
    await this.logActivityByUser('Logout', userId, ip, userAgent, 'success', 'User logged out successfully');
    return { message: 'Logout successful' };
  }

  private async logActivityByUser(action: string, userId: string, ip: string, userAgent: string, status: string, details?: string) {
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
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  private async logActivity(action: string, ip: string, userAgent: string, status: string, details?: string) {
    try {
      await this.prisma.activityLog.create({
        data: {
          action,
          userId: 'system', // For system-level activities
          ipAddress: ip,
          userAgent,
          status,
          details,
        },
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}