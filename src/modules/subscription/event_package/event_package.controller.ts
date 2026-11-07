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
import { EventPackageService } from './event_package.service';
import { CreateEventPackageDto } from './dto/create-event_package.dto';
import { UpdateEventPackageDto } from './dto/update-event_package.dto';
import { QueryEventPackageDto } from './dto/query-event_package.dto';
import { getPagination, handleError } from 'src/core/util/helper';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';
import { JwtAdminGuard } from 'src/core/shared/guard/jwt-admin.guard';

@ApiBearerAuth()
@ApiTags('Subscription - Event Packages')
@Controller('event-packages')
export class EventPackageController {
  constructor(
    private readonly appLoggerService: AppLoggerService,
    private readonly eventPackageService: EventPackageService,
  ) { }

  @UseGuards(JwtAdminGuard)
  @Post()
  async create(@Body(ValidationPipe) createEventPackageDto: CreateEventPackageDto) {
    try {
      const eventPackage = await this.eventPackageService.create(createEventPackageDto);
      return {
        message: 'Event package created successfully',
        status_code: HttpStatus.CREATED,
        data: {
          event_package: eventPackage,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventPackageController.name} - ${this.create.name}`);
    }
  }

  @Get('simple')
  async findAllSimple(@Query(ValidationPipe) queryEventPackageDto: QueryEventPackageDto) {
    try {
      const result = await this.eventPackageService.findAllSimple(queryEventPackageDto);
      return {
        message: 'Event packages fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_packages: result.eventPackages,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventPackageController.name} - ${this.findAllSimple.name}`);
    }
  }

  @Get()
  async findAll(@Query(ValidationPipe) queryEventPackageDto: QueryEventPackageDto) {
    try {
      const result = await this.eventPackageService.findAll(queryEventPackageDto);
      return {
        message: 'Event packages fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_packages: result.eventPackages,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventPackageController.name} - ${this.findAll.name}`);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const eventPackage = await this.eventPackageService.findOne(id);
      return {
        message: 'Event package fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_package: eventPackage,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventPackageController.name} - ${this.findOne.name}`);
    }
  }

  @UseGuards(JwtAdminGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateEventPackageDto: UpdateEventPackageDto,
  ) {
    try {
      const eventPackage = await this.eventPackageService.update(id, updateEventPackageDto);
      return {
        message: 'Event package updated successfully',
        status_code: HttpStatus.OK,
        data: {
          event_package: eventPackage,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventPackageController.name} - ${this.update.name}`);
    }
  }

  @UseGuards(JwtAdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const eventPackage = await this.eventPackageService.remove(id);
      return {
        message: 'Event package deleted successfully',
        status_code: HttpStatus.OK,
        data: {
          event_package: eventPackage,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventPackageController.name} - ${this.remove.name}`);
    }
  }
}
