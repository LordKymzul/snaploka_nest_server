import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { QueryAdminDto } from './dto/query-admin.dto';
import { getPagination, handleError } from 'src/core/util/helper';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';
import { JwtAdminGuard } from 'src/core/shared/guard/jwt-admin.guard';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {



  constructor(
    private readonly adminService: AdminService,
    private readonly logger: AppLoggerService,
  ) { }


  @UseGuards(JwtAdminGuard)
  @Get()
  async findAll(@Query(ValidationPipe) queryAdminDto: QueryAdminDto) {
    try {
      const admins = await this.adminService.findAll(queryAdminDto);
      return {
        message: 'Admins fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          admins: admins.admins,
          pagination: getPagination(admins.page, admins.limit, admins.total),
        },
      };
    } catch (error) {
      handleError(error, this.logger, `${AdminController.name} - findAll`);
    }
  }

  @UseGuards(JwtAdminGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const admin = await this.adminService.findOne(id);
      return {
        message: 'Admin fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          admin,
        },
      };
    } catch (error) {
      handleError(error, this.logger, `${AdminController.name} - findOne`);
    }
  }



}
