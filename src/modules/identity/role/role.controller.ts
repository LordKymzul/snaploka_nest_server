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
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { getPagination, handleError } from 'src/core/util/helper';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';

@ApiBearerAuth()
@ApiTags('Identity - Roles')
@Controller('roles')
export class RoleController {
  constructor(
    private readonly appLoggerService: AppLoggerService,
    private readonly roleService: RoleService,
  ) { }

  @Post()
  async create(@Body(ValidationPipe) createRoleDto: CreateRoleDto) {
    try {
      const role = await this.roleService.create(createRoleDto);
      return {
        message: 'Role created successfully',
        status_code: HttpStatus.CREATED,
        data: {
          role,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${RoleController.name} - ${this.create.name}`);
    }
  }

  @Get()
  async findAll(@Query(ValidationPipe) queryRoleDto: QueryRoleDto) {
    try {
      const result = await this.roleService.findAll(queryRoleDto);
      return {
        message: 'Roles fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          roles: result.roles,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${RoleController.name} - ${this.findAll.name}`);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const role = await this.roleService.findOne(id);
      return {
        message: 'Role fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          role,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${RoleController.name} - ${this.findOne.name}`);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateRoleDto: UpdateRoleDto,
  ) {
    try {
      const role = await this.roleService.update(id, updateRoleDto);
      return {
        message: 'Role updated successfully',
        status_code: HttpStatus.OK,
        data: {
          role,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${RoleController.name} - ${this.update.name}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const role = await this.roleService.remove(id);
      return {
        message: 'Role deleted successfully',
        status_code: HttpStatus.OK,
        data: {
          role,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${RoleController.name} - ${this.remove.name}`);
    }
  }
}
