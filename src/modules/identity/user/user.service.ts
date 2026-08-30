import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { UserRepository } from './user.repository';
import { AUTH_PROVIDER, PAGINATION_LIMIT, PAGINATION_PAGE, USER_ROLE } from 'src/core/util/constant';
import * as bcrypt from 'bcrypt';
import { AuthProviderRepository } from '../auth_provider/auth_provider.repository';
import { UserEntity } from './entities/user.entity';
import { AdminService } from '../admin/admin.service';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';

@Injectable()
export class UserService {
  constructor(
    private readonly dbappService: DbappService,
    private readonly userRepository: UserRepository,
    private readonly authProviderRepository: AuthProviderRepository,
    private readonly adminService: AdminService,
    private readonly appLoggerService: AppLoggerService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const {
      email,
      password,
      auth_provider,
      name,
      is_active,
      metadata,
      role
    } = createUserDto;

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    let hashedPassword = '-';

    if (auth_provider === AUTH_PROVIDER.CUSTOM) {
      if (!password) {
        throw new BadRequestException('Password is required');
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const authProviderId = await this.authProviderRepository.findInternalIdByName(auth_provider);

    if (!authProviderId) {
      throw new NotFoundException('Auth provider not found');
    }

    const metadataValue = metadata ? JSON.stringify(metadata) : null;
    const userName = name || email.split('@')[0];

    const userGuid = await this.dbappService.$transaction(async (tx) => {
      const createdUsers = await tx.$queryRaw<{ id: number; guid: string }[]>`
        INSERT INTO users (name, email, password, is_active, metadata)
        VALUES (
          ${userName},
          ${email},
          ${hashedPassword},
          ${is_active ?? true},
          ${metadataValue}::jsonb
        )
        RETURNING id, guid
      `;

      if (!createdUsers || createdUsers.length === 0) {
        throw new BadRequestException('Failed to create user');
      }

      const user = createdUsers[0];

      await tx.$queryRaw`
        INSERT INTO user_auth_providers (user_id, auth_provider_id)
        VALUES (${user.id}, ${authProviderId})
      `;

      if (role === USER_ROLE.ADMIN) {
        await this.adminService.createFromUser({
          user_id: user.guid,
          is_active: true,
          metadata: {},
        }, user.id, tx);
        this.appLoggerService.info(`Admin created for user ${user.guid}`, { user }, `${UserService.name} - ${this.create.name}`);
      }
      return user.guid;
    });



    return this.findOne(userGuid);
  }

  async findAll(queryUserDto: QueryUserDto): Promise<{
    total: number;
    users: UserEntity[];
    page: number;
    limit: number;
  }> {
    const { keyword, is_active, page, limit } = queryUserDto;

    const pageNum = Number(page || PAGINATION_PAGE);
    const limitNum = Number(limit || PAGINATION_LIMIT);
    const skip = (pageNum - PAGINATION_PAGE) * limitNum;
    const take = limitNum;

    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (keyword) {
      whereConditions.push(
        `(LOWER(u.name) LIKE LOWER(CONCAT('%', $${paramIndex}, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', $${paramIndex}, '%')))`,
      );
      queryParams.push(keyword);
      paramIndex++;
    }

    if (is_active !== undefined) {
      whereConditions.push(`u.is_active = $${paramIndex}`);
      queryParams.push(is_active === 'true');
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const query = `
      SELECT
        u.guid as id,
        u.name,
        u.email,
        u.is_active,
        u.metadata,
        u.last_signed_at,
        u.created_at,
        u.updated_at
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(take, skip);

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM users u
      ${whereClause}
    `;

    const countParams = queryParams.slice(0, -2);

    const [totalResult, users] = await Promise.all([
      this.dbappService.$queryRawUnsafe<any[]>(countQuery, ...countParams),
      this.dbappService.$queryRawUnsafe<any[]>(query, ...queryParams),
    ]);

    const total = totalResult[0]?.total || 0;

    return {
      total,
      users: users.map((user) => UserEntity.fromDBApplication(user)),
      page: pageNum,
      limit: limitNum,
    };
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findByGuid(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const {
      name,
      email,
      password,
      is_active,
      metadata,
    } = updateUserDto;

    const existingUser = await this.dbappService.user.findUnique({
      where: { guid: id },
      select: { id: true, email: true },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (email && email !== existingUser.email) {
      const emailConflict = await this.dbappService.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (emailConflict) {
        throw new ConflictException('User already exists with this email');
      }
    }

    let hashedPassword: string | undefined;
    if (password !== undefined) {
      if (!password) {
        throw new BadRequestException('Password cannot be empty');
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const user = await this.dbappService.user.update({
      where: { guid: id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(hashedPassword !== undefined && { password: hashedPassword }),
        ...(is_active !== undefined && { is_active }),
        ...(metadata !== undefined && { metadata }),
      },
    });

    return UserEntity.fromDBApplication({
      ...user,
      password: undefined,
    });
  }

  async remove(id: string): Promise<string> {
    const existingUser = await this.dbappService.user.findUnique({
      where: { guid: id },
      select: { id: true },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const user = await this.dbappService.user.delete({
      where: { guid: id },
    });

    return user.guid;
  }
}
