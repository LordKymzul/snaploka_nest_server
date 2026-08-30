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
} from '@nestjs/common';
import { AuthProviderService } from './auth_provider.service';
import { CreateAuthProviderDto } from './dto/create-auth_provider.dto';
import { UpdateAuthProviderDto } from './dto/update-auth_provider.dto';
import { QueryAuthProviderDto } from './dto/query-auth_provider.dto';
import { getPagination, handleError } from 'src/core/util/helper';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';

@ApiBearerAuth()
@ApiTags('Identity - Auth Providers')
@Controller('auth-providers')
export class AuthProviderController {
  constructor(
    private readonly appLoggerService: AppLoggerService,
    private readonly authProviderService: AuthProviderService,
  ) { }

  @Post()
  async create(@Body(ValidationPipe) createAuthProviderDto: CreateAuthProviderDto) {
    try {
      const authProvider = await this.authProviderService.create(createAuthProviderDto);
      return {
        message: 'Auth provider created successfully',
        status_code: HttpStatus.CREATED,
        data: {
          auth_provider: authProvider,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${AuthProviderController.name} - ${this.create.name}`);
    }
  }

  @Get()
  async findAll(@Query(ValidationPipe) queryAuthProviderDto: QueryAuthProviderDto) {
    try {
      const result = await this.authProviderService.findAll(queryAuthProviderDto);
      return {
        message: 'Auth providers fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          auth_providers: result.authProviders,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${AuthProviderController.name} - ${this.findAll.name}`);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const authProvider = await this.authProviderService.findOne(id);
      return {
        message: 'Auth provider fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          auth_provider: authProvider,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${AuthProviderController.name} - ${this.findOne.name}`);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateAuthProviderDto: UpdateAuthProviderDto,
  ) {
    try {
      const authProvider = await this.authProviderService.update(id, updateAuthProviderDto);
      return {
        message: 'Auth provider updated successfully',
        status_code: HttpStatus.OK,
        data: {
          auth_provider: authProvider,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${AuthProviderController.name} - ${this.update.name}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const authProvider = await this.authProviderService.remove(id);
      return {
        message: 'Auth provider deleted successfully',
        status_code: HttpStatus.OK,
        data: {
          auth_provider: authProvider,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${AuthProviderController.name} - ${this.remove.name}`);
    }
  }
}
