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
  Req,
  UnauthorizedException,
  UseGuards,
  Res,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { authorizeUserOrAdmin, getPagination, handleError } from 'src/core/util/helper';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';
import {
  Request,
  Response
} from 'express';
import { RequestWithUser } from 'src/core/util/interface';
import { JwtAdminGuard } from 'src/core/shared/guard/jwt-admin.guard';


@ApiBearerAuth()
@ApiTags('Engagement - Events')
@Controller('events')
export class EventController {
  constructor(
    private readonly appLoggerService: AppLoggerService,
    private readonly eventService: EventService,
  ) { }

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) createEventDto: CreateEventDto,
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const event = await this.eventService.create(createEventDto, user.id);
      return {
        message: 'Event created successfully',
        status_code: HttpStatus.CREATED,
        data: {
          event,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventController.name} - ${this.create.name}`);
    }
  }

  @Get(':id/qr-code')
  async getEventQrCode(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const qrCode = await this.eventService.getEventQrCode(id);
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(qrCode);
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventController.name} - ${this.getEventQrCode.name}`);
    }
  }

  @Get('user/:user_id')
  async findAllByUserId(
    @Req() req: RequestWithUser,
    @Query(ValidationPipe) queryEventDto: QueryEventDto,
    @Param('user_id') user_id: string,
  ) {
    try {
      const { is_authorized, message } = authorizeUserOrAdmin(req, user_id);
      if (!is_authorized) {
        throw new UnauthorizedException(message);
      }
      const result = await this.eventService.findAllByUser(queryEventDto, user_id);
      return {
        message: 'Events fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          events: result.events,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventController.name} - ${this.findAllByUserId.name}`);
    }
  }



  @UseGuards(JwtAdminGuard)
  @Get()
  async findAll(
    @Query(ValidationPipe) queryEventDto: QueryEventDto,
  ) {
    try {
      const result = await this.eventService.findAll(queryEventDto);
      return {
        message: 'Events fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          events: result.events,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventController.name} - ${this.findAll.name}`);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const event = await this.eventService.findOne(id);
      return {
        message: 'Event fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventController.name} - ${this.findOne.name}`);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateEventDto: UpdateEventDto,
  ) {
    try {
      const event = await this.eventService.update(id, updateEventDto);
      return {
        message: 'Event updated successfully',
        status_code: HttpStatus.OK,
        data: {
          event,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventController.name} - ${this.update.name}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const event = await this.eventService.remove(id);
      return {
        message: 'Event deleted successfully',
        status_code: HttpStatus.OK,
        data: {
          event,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventController.name} - ${this.remove.name}`);
    }
  }
}
