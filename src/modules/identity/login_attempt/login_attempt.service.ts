import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLoginAttemptDto } from './dto/create-login_attempt.dto';
import { UpdateLoginAttemptDto } from './dto/update-login_attempt.dto';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { LoginAttemptEntity } from './entities/login_attempt.entity';
import { PAGINATION_LIMIT, PAGINATION_PAGE } from 'src/core/util/constant';
import { QueryLoginAttemptDto } from './dto/query-login_attempt.dto';
import { UserRepository } from '../user/user.repository';
import { LoginAttemptRepository } from './login_attempt.repository';

@Injectable()
export class LoginAttemptService {

  constructor(private readonly dbappService: DbappService, private readonly userRepository: UserRepository, private readonly loginAttemptRepository: LoginAttemptRepository) { }

  async create(createLoginAttemptDto: CreateLoginAttemptDto): Promise<LoginAttemptEntity> {
    const {
      email_attempted,
      ip_address,
      user_agent,
      metadata,
      user_id,
      is_success,
      failure_reason,
    } = createLoginAttemptDto;

    let userInternalId: number | null = null;

    if (user_id) {
      const user = await this.userRepository.findInternalIdByGuid(user_id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      userInternalId = user;
    }

    const createdLoginAttempts = await this.dbappService.$queryRawUnsafe<any[]>(
      `
      INSERT INTO login_attempts (
        email_attempted,
        ip_address,
        user_agent,
        metadata,
        user_id,
        is_success,
        failure_reason
      )
      VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)
      RETURNING
        guid as id,
        email_attempted,
        is_success,
        failure_reason,
        ip_address,
        user_agent,
        metadata,
        created_at
      `,
      email_attempted,
      ip_address,
      user_agent ?? null,
      metadata ? JSON.stringify(metadata) : null,
      userInternalId,
      is_success,
      failure_reason ?? null,
    );

    if (!createdLoginAttempts || createdLoginAttempts.length === 0) {
      throw new BadRequestException('Failed to create login attempt');
    }

    return LoginAttemptEntity.fromDBApplication({
      ...createdLoginAttempts[0],
      user_id: userInternalId ? user_id : null,
    });
  }

  async findAll(queryLoginAttemptDto: QueryLoginAttemptDto): Promise<{
    total: number;
    loginAttempts: LoginAttemptEntity[];
    page: number;
    limit: number;
  }> {
    const {
      keyword,
      user_id,
      is_success,
      page,
      limit,
      with_user,
    } = queryLoginAttemptDto;

    const pageNum = Number(page || PAGINATION_PAGE);
    const limitNum = Number(limit || PAGINATION_LIMIT);
    const skip = (pageNum - PAGINATION_PAGE) * limitNum;
    const take = limitNum;

    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (keyword) {
      whereConditions.push(`(la.email_attempted ILIKE $${paramIndex} OR la.ip_address ILIKE $${paramIndex})`);
      queryParams.push(`%${keyword}%`);
      paramIndex++;
    }

    if (user_id) {
      whereConditions.push(`u.guid = $${paramIndex}`);
      queryParams.push(user_id);
      paramIndex++;
    }

    if (is_success !== undefined) {
      whereConditions.push(`la.is_success = $${paramIndex}`);
      queryParams.push(is_success === 'true');
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
          'created_at', u.created_at,
          'updated_at', u.updated_at
        ) as user
      `);
    }

    const conditionalFieldsClause = conditionalFields.length > 0 ? `, ${conditionalFields.join(', ')}` : '';

    const query = `
      SELECT
        la.guid as id,
        la.email_attempted,
        u.guid as user_id,
        la.is_success,
        la.failure_reason,
        la.ip_address,
        la.user_agent,
        la.metadata,
        la.created_at
        ${conditionalFieldsClause}
      FROM login_attempts la
      LEFT JOIN users u ON la.user_id = u.id
      ${whereClause}
      ORDER BY la.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(take, skip);

    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM login_attempts la
      LEFT JOIN users u ON la.user_id = u.id
      ${whereClause}
    `;

    const countParams = queryParams.slice(0, -2);

    const [totalResult, loginAttempts] = await Promise.all([
      this.dbappService.$queryRawUnsafe<any[]>(countQuery, ...countParams),
      this.dbappService.$queryRawUnsafe<any[]>(query, ...queryParams),
    ]);

    const total = totalResult[0]?.total || 0;

    return {
      total,
      loginAttempts: loginAttempts.map((attempt) =>
        LoginAttemptEntity.fromDBApplication(attempt),
      ),
      page: pageNum,
      limit: limitNum,
    };
  }

  async findAllByUserId(
    userId: string,
    queryLoginAttemptDto: QueryLoginAttemptDto,
  ) {
    return this.findAll({
      ...queryLoginAttemptDto,
      user_id: userId,
    });
  }

  async findOne(id: string): Promise<LoginAttemptEntity> {
    const loginAttempt = await this.dbappService.loginAttempt.findUnique({
      where: { guid: id },
      include: {
        user: {
          select: {
            guid: true,
            name: true,
            email: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    });

    if (!loginAttempt) {
      throw new NotFoundException('Login attempt not found');
    }

    return LoginAttemptEntity.fromDBApplication(loginAttempt);
  }

  async update(id: string, updateLoginAttemptDto: UpdateLoginAttemptDto): Promise<LoginAttemptEntity> {
    const {
      email_attempted,
      ip_address,
      user_agent,
      metadata,
      user_id,
      is_success,
      failure_reason,
    } = updateLoginAttemptDto;

    const existingAttempt = await this.dbappService.loginAttempt.findUnique({
      where: { guid: id },
      select: { id: true },
    });

    if (!existingAttempt) {
      throw new NotFoundException('Login attempt not found');
    }

    let userInternalId: number | undefined;
    if (user_id !== undefined) {
      if (user_id) {
        const user = await this.userRepository.findInternalIdByGuid(user_id);
        if (!user) {
          throw new NotFoundException('User not found');
        }
        userInternalId = user;
      } else {
        userInternalId = undefined;
      }
    }

    const loginAttempt = await this.dbappService.loginAttempt.update({
      where: { guid: id },
      data: {
        ...(email_attempted !== undefined && { email_attempted }),
        ...(ip_address !== undefined && { ip_address }),
        ...(user_agent !== undefined && { user_agent }),
        ...(metadata !== undefined && { metadata }),
        ...(user_id !== undefined && { user_id: userInternalId }),
        ...(is_success !== undefined && { is_success }),
        ...(failure_reason !== undefined && { failure_reason }),
      },
      include: {
        user: {
          select: {
            guid: true,
            name: true,
            email: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    });

    return LoginAttemptEntity.fromDBApplication(loginAttempt);
  }

  async remove(id: string): Promise<LoginAttemptEntity> {
    const existingAttempt = await this.dbappService.loginAttempt.findUnique({
      where: { guid: id },
      select: { id: true },
    });

    if (!existingAttempt) {
      throw new NotFoundException('Login attempt not found');
    }

    const loginAttempt = await this.dbappService.loginAttempt.delete({
      where: { guid: id },
    });

    return LoginAttemptEntity.fromDBApplication(loginAttempt);
  }

  async getRecentFailedAttempts(
    emailOrIp: string,
    type: 'email' | 'ip',
    minutes: number = 15,
  ): Promise<number> {
    const since = new Date(Date.now() - minutes * 60 * 1000);

    const whereClause = type === 'email'
      ? { email_attempted: emailOrIp }
      : { ip_address: emailOrIp };

    const count = await this.dbappService.loginAttempt.count({
      where: {
        ...whereClause,
        is_success: false,
        created_at: {
          gte: since,
        },
      },
    });

    return count;
  }

  async getUserLoginHistory(userId: string, limit: number = 10) {
    const user = await this.userRepository.findInternalIdByGuid(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const attempts = await this.dbappService.loginAttempt.findMany({
      where: {
        user_id: user,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
    });

    return attempts.map(attempt => LoginAttemptEntity.fromDBApplication(attempt));
  }
}
