import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const { name, description, canView, canEdit, canExport, canDelete } = createRoleDto;

    // Check if role already exists
    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
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

  async findOne(id: string) {
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
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    // Check if role exists
    const existingRole = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }

    // Check if name is being changed and if it conflicts with existing role
    if (updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
      const nameConflict = await this.prisma.role.findUnique({
        where: { name: updateRoleDto.name },
      });

      if (nameConflict) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  async remove(id: string) {
    // Check if role exists
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
      throw new NotFoundException('Role not found');
    }

    // Check if role is being used by users
    if (role._count.users > 0) {
      throw new BadRequestException('Cannot delete role that is being used by users');
    }

    // Soft delete by setting isActive to false
    return this.prisma.role.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async findByName(name: string) {
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
}