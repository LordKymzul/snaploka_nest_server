import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { transformGuidToId } from 'src/core/util/helper';
import { EVENT_NAMES, PAGINATION_LIMIT, PAGINATION_PAGE, ROLE, ROLE_ID, STUDENT_STATUS } from 'src/core/util/constant';
import { OnEvent } from '@nestjs/event-emitter';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';
import { Prisma } from '@prisma/client';
import { QueryAdminDto } from './dto/query-admin.dto';
import { AdminRepository } from './admin.repository';

@Injectable()
export class AdminService {

  constructor(
    private readonly prisma: DbappService,
    private readonly logger: AppLoggerService,
    private readonly adminRepository: AdminRepository,
  ) { }

  async createFromUser(createAdminDto: CreateAdminDto, user_id: number, tx: Prisma.TransactionClient) {
    const {
      is_active = true,
      metadata,
    } = createAdminDto;

    const existingAdmin = await this.adminRepository.findByUserId(user_id);
    if (existingAdmin) {
      throw new ConflictException('Admin already exists for this user');
    }
    
    const createdAdmin = await tx.$queryRaw<{ id: number; guid: string }[]>`
        INSERT INTO admins (user_id, is_active, metadata)
        VALUES (
          ${user_id},
          ${is_active ?? true},
          ${metadata ? JSON.stringify(metadata) : null}::jsonb
        )
        RETURNING id, guid
      `;
    return {
      id: createdAdmin[0].guid,
    }


  }

  async create(createAdminDto: CreateAdminDto) {
    const {
      user_id,
      is_active = true,
      metadata,
    } = createAdminDto;

    const [role, user] = await Promise.all([
      this.prisma.role.findUnique({
        where: { name: ROLE.ADMIN },
        select: { id: true },
      }),
      this.prisma.user.findUnique({
        where: { guid: user_id },
        select: {
          id: true,
          admin: {
            select: {
              id: true,
              deleted_at: true,
            },
          },
        },
      }),
    ]);

    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.admin && !user.admin.deleted_at) {
      throw new ConflictException('Admin already exists for this user');
    }

    return await this.prisma.$transaction(async (tx) => {
      const admin = user.admin?.deleted_at
        ? await tx.admin.update({
          where: { user_id: user.id },
          data: {
            is_active,
            metadata,
            deleted_at: null,
          },
          omit: { user_id: true },
          include: {
            user: {
              select: {
                guid: true,
                name: true,
                email: true,
                is_active: true,
              },
            },
          },
        })
        : await tx.admin.create({
          data: {
            user_id: user.id,
            is_active,
            metadata,
          },
          omit: { user_id: true },
          include: {
            user: {
              select: {
                guid: true,
                name: true,
                email: true,
                is_active: true,
              },
            },
          },
        });

      const existingAdminRole = await tx.userRole.findUnique({
        where: { user_id_role_id: { user_id: user.id, role_id: role.id } },
        select: { id: true },
      });

      if (!existingAdminRole) {
        await tx.userRole.create({
          data: {
            user_id: user.id,
            role_id: role.id,
          },
        });
      }

      return transformGuidToId(this.formatAdmin(admin));
    });
  }

  async findAll(queryAdminDto: QueryAdminDto) {
    const {
      user_id,
      is_active,
      page,
      limit,
      with_user = 'true',
    } = queryAdminDto;

    const pageNum = Number(page || PAGINATION_PAGE);
    const limitNum = Number(limit || PAGINATION_LIMIT);
    const skip = (pageNum - PAGINATION_PAGE) * limitNum;
    const take = limitNum;

    const whereConditions: string[] = ['a.deleted_at IS NULL'];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (user_id) {
      whereConditions.push(`u.guid = $${paramIndex}`);
      queryParams.push(user_id);
      paramIndex++;
    }

    if (is_active !== undefined) {
      whereConditions.push(`a.is_active = $${paramIndex}`);
      queryParams.push(is_active === 'true');
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const conditionalFields: string[] = [];
    if (with_user === 'true') {
      conditionalFields.push(`
        json_build_object(
          'id', u.guid,
          'name', u.name,
          'email', u.email,
          'is_active', u.is_active
        ) as user
      `);
    }

    const optionalFields = conditionalFields.length > 0
      ? `, ${conditionalFields.join(', ')}`
      : '';

    const query = `
      SELECT
        a.guid as id,
        a.is_active,
        a.metadata,
        a.created_at,
        a.updated_at
        ${optionalFields}
      FROM admins a
      INNER JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(take, skip);
    paramIndex += 2;

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM admins a
      INNER JOIN users u ON a.user_id = u.id
      ${whereClause}
    `;

    const countParams = queryParams.slice(0, -2);

    const [totalResult, admins] = await Promise.all([
      this.prisma.$queryRawUnsafe<any[]>(countQuery, ...countParams),
      this.prisma.$queryRawUnsafe<any[]>(query, ...queryParams),
    ]);

    const total = totalResult[0]?.total || 0;

    return {
      total,
      admins,
      page: pageNum,
      limit: limitNum,
    };
  }

  async findOne(id: string) {
    const admin = await this.prisma.admin.findFirst({
      where: {
        guid: id,
        deleted_at: null,
      },
      omit: { user_id: true },
      include: {
        user: {
          select: {
            guid: true,
            name: true,
            email: true,
            is_active: true,
          },
        },
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return transformGuidToId(this.formatAdmin(admin));
  }

  async update(id: string, updateAdminDto: UpdateAdminDto) {
    const {
      user_id,
      is_active,
      metadata,
    } = updateAdminDto;

    const existingAdmin = await this.prisma.admin.findFirst({
      where: {
        guid: id,
        deleted_at: null,
      },
      select: {
        id: true,
      },
    });

    if (!existingAdmin) {
      throw new NotFoundException('Admin not found');
    }

    let userInternalId: number | undefined;
    if (user_id) {
      const user = await this.prisma.user.findUnique({
        where: { guid: user_id },
        select: { id: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const adminWithSameUser = await this.prisma.admin.findFirst({
        where: {
          user_id: user.id,
          deleted_at: null,
          id: {
            not: existingAdmin.id,
          },
        },
      });

      if (adminWithSameUser) {
        throw new ConflictException('User is already associated with another admin');
      }

      userInternalId = user.id;
    }

    const admin = await this.prisma.admin.update({
      where: { guid: id },
      data: {
        ...(userInternalId && { user_id: userInternalId }),
        ...(is_active !== undefined && { is_active }),
        ...(metadata !== undefined && { metadata }),
      },
      omit: { user_id: true },
      include: {
        user: {
          select: {
            guid: true,
            name: true,
            email: true,
            is_active: true,
          },
        },
      },
    });

    return transformGuidToId(this.formatAdmin(admin));
  }

  async remove(id: string) {
    const [role, admin] = await Promise.all([
      this.prisma.role.findUnique({
        where: { name: ROLE.ADMIN },
        select: { id: true },
      }),
      this.prisma.admin.findFirst({
        where: {
          guid: id,
          deleted_at: null,
        },
        select: {
          id: true,
          user_id: true,
        },
      }),
    ]);

    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return await this.prisma.$transaction(async (tx) => {
      const deletedAdmin = await tx.admin.update({
        where: { guid: id },
        data: {
          deleted_at: new Date(),
          is_active: false,
        },
        omit: { user_id: true },
      });

      const adminRole = await tx.userRole.findUnique({
        where: { user_id_role_id: { user_id: admin.user_id, role_id: role.id } },
        select: { id: true },
      });

      if (adminRole) {
        await tx.userRole.delete({
          where: { id: adminRole.id },
        });
      }

      return transformGuidToId(deletedAdmin);
    });
  }

  private formatAdmin(admin: {
    user?: {
      guid: string;
      name: string | null;
      email: string;
      is_active: boolean;
    } | null;
    [key: string]: any;
  }) {
    return {
      ...admin,
      user: admin.user
        ? {
          id: admin.user.guid,
          name: admin.user.name,
          email: admin.user.email,
          is_active: admin.user.is_active,
        }
        : null,
    };
  }





}
