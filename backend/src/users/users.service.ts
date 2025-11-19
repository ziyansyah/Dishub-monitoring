import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, username, name, password, roleId, avatar } = createUserDto;

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
      const field = existingUser.email === email ? 'email' : 'username';
      throw new ConflictException(`User with this ${field} already exists`);
    }

    // Validate role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role || !role.isActive) {
      throw new BadRequestException('Invalid or inactive role');
    }

    // Hash password
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

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll(query: QueryUsersDto) {
    const {
      page = 1,
      limit = 10,
      search,
      roleId,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    // Search by name, username, or email
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { username: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // Filter by role
    if (roleId) {
      where.roleId = roleId;
    }

    // Filter by active status
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

    // Remove passwords from response
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

  async findOne(id: string) {
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
      throw new NotFoundException('User not found');
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { email, username, password, roleId, ...otherData } = updateUserDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check for email/username conflicts
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
        throw new ConflictException(`User with this ${field} already exists`);
      }
    }

    // Validate role if provided
    if (roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role || !role.isActive) {
        throw new BadRequestException('Invalid or inactive role');
      }
    }

    const updateData: any = { ...otherData };

    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (roleId) updateData.roleId = roleId;

    // Hash password if provided
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

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async remove(id: string) {
    // Check if user exists
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
      throw new NotFoundException('User not found');
    }

    // Check if user has related data
    if (user._count.scans > 0 || user._count.generatedReports > 0) {
      throw new BadRequestException('Cannot delete user with associated data. Consider deactivating instead.');
    }

    // Soft delete by setting isActive to false
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

  async toggleActiveStatus(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
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
}