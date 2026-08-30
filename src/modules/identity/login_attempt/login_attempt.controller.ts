import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  HttpStatus,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginAttemptService } from './login_attempt.service';
import { CreateLoginAttemptDto } from './dto/create-login_attempt.dto';
import { UpdateLoginAttemptDto } from './dto/update-login_attempt.dto';
import { QueryLoginAttemptDto } from './dto/query-login_attempt.dto';
import { authorizeUserOrAdmin, getPagination, handleError, isAdmin } from 'src/core/util/helper';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';
import { JwtAdminGuard } from 'src/core/shared/guard/jwt-admin.guard';

@ApiBearerAuth()
@ApiTags('Identity - Login Attempts')
@Controller('login-attempts')
export class LoginAttemptController {
  constructor(
    private readonly appLoggerService: AppLoggerService,
    private readonly loginAttemptService: LoginAttemptService,
  ) { }

  @Post()
  async create(@Body(ValidationPipe) createLoginAttemptDto: CreateLoginAttemptDto) {
    try {
      const loginAttempt = await this.loginAttemptService.create(createLoginAttemptDto);
      return {
        message: 'Login attempt logged successfully',
        status_code: HttpStatus.CREATED,
        data: {
          login_attempt: loginAttempt,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${LoginAttemptController.name} - ${this.create.name}`);
    }
  }

  @UseGuards(JwtAdminGuard)
  @Get()
  async findAll(@Query(ValidationPipe) queryLoginAttemptDto: QueryLoginAttemptDto) {
    try {
      const result = await this.loginAttemptService.findAll(queryLoginAttemptDto);
      return {
        message: 'Login attempts fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          login_attempts: result.loginAttempts,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${LoginAttemptController.name} - ${this.findAll.name}`);
    }
  }

  @Get('user/:userId')
  async findAllByUserId(
    @Req() req: Request,
    @Param('userId') userId: string,
    @Query(ValidationPipe) queryLoginAttemptDto: QueryLoginAttemptDto,
  ) {
    try {
      const {
        is_authorized,
        message,
      } = authorizeUserOrAdmin(req, userId);

      if (!is_authorized) {
        throw new UnauthorizedException(message);
      }

      const result = await this.loginAttemptService.findAllByUserId(userId, queryLoginAttemptDto);
      return {
        message: 'Login attempts fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          login_attempts: result.loginAttempts,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${LoginAttemptController.name} - ${this.findAllByUserId.name}`);
    }
  }

  @Get('user/:userId/history')
  async getUserLoginHistory(
    @Req() req: Request,
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const {
        is_authorized,
        message,
      } = authorizeUserOrAdmin(req, userId);

      if (!is_authorized) {
        throw new UnauthorizedException(message);
      }

      const attempts = await this.loginAttemptService.getUserLoginHistory(
        userId,
        limit ? Number(limit) : 10,
      );

      return {
        message: 'Login history fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          login_attempts: attempts,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${LoginAttemptController.name} - ${this.getUserLoginHistory.name}`);
    }
  }

  @Get(':id')
  async findOne(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    try {
      const authedUser = (req as any)?.user;

      if (!authedUser?.id) {
        throw new UnauthorizedException('User not found or unauthorized');
      }

      const loginAttempt = await this.loginAttemptService.findOne(id);

      // Admin can view any, users can only view their own
      if (!isAdmin(authedUser) && loginAttempt.user_id !== authedUser.id) {
        throw new UnauthorizedException('You are not authorized to view this login attempt');
      }

      return {
        message: 'Login attempt fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          login_attempt: loginAttempt,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${LoginAttemptController.name} - ${this.findOne.name}`);
    }
  }

  @UseGuards(JwtAdminGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateLoginAttemptDto: UpdateLoginAttemptDto,
  ) {
    try {
      const loginAttempt = await this.loginAttemptService.update(id, updateLoginAttemptDto);
      return {
        message: 'Login attempt updated successfully',
        status_code: HttpStatus.OK,
        data: {
          login_attempt: loginAttempt,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${LoginAttemptController.name} - ${this.update.name}`);
    }
  }

  @UseGuards(JwtAdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const loginAttempt = await this.loginAttemptService.remove(id);
      return {
        message: 'Login attempt deleted successfully',
        status_code: HttpStatus.OK,
        data: {
          login_attempt: loginAttempt,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${LoginAttemptController.name} - ${this.remove.name}`);
    }
  }
}
