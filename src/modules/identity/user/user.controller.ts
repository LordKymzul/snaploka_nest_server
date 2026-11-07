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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { getPagination, handleError } from 'src/core/util/helper';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';
import { JwtAdminGuard } from 'src/core/shared/guard/jwt-admin.guard';

@ApiBearerAuth()
@ApiTags('Identity - Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly appLoggerService: AppLoggerService,
    private readonly userService: UserService,
  ) { }

  @Post()
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.create(createUserDto);
      return {
        message: 'User created successfully',
        status_code: HttpStatus.CREATED,
        data: {
          user,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${UserController.name} - ${this.create.name}`);
    }
  }

  @UseGuards(JwtAdminGuard)
  @Get()
  async findAll(@Query(ValidationPipe) queryUserDto: QueryUserDto) {
    try {
      const result = await this.userService.findAll(queryUserDto);
      return {
        message: 'Users fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          users: result.users,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${UserController.name} - ${this.findAll.name}`);
    }
  }

  @Get('email')
  async findByEmail(@Query('email') email: string) {
    try {
      const user = await this.userService.findByEmail(email);
      return {
        message: 'User fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          user,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${UserController.name} - ${this.findByEmail.name}`);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.userService.findOne(id);
      return {
        message: 'User fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          user,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${UserController.name} - ${this.findOne.name}`);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    try {
      const user = await this.userService.update(id, updateUserDto);
      return {
        message: 'User updated successfully',
        status_code: HttpStatus.OK,
        data: {
          user,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${UserController.name} - ${this.update.name}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const user = await this.userService.remove(id);
      return {
        message: 'User deleted successfully',
        status_code: HttpStatus.OK,
        data: {
          user: {
            id: user,
          },
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${UserController.name} - ${this.remove.name}`);
    }
  }
}
