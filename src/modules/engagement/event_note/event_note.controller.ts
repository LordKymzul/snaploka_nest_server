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
import { EventNoteService } from './event_note.service';
import { CreateEventNoteDto } from './dto/create-event_note.dto';
import { UpdateEventNoteDto } from './dto/update-event_note.dto';
import { QueryEventNoteDto } from './dto/query-event_note.dto';
import { getPagination, handleError } from 'src/core/util/helper';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';
import { JwtAdminGuard } from 'src/core/shared/guard/jwt-admin.guard';


@ApiBearerAuth()
@ApiTags('Engagement - Event Notes')
@Controller('event-note')
export class EventNoteController {
  constructor(
    private readonly appLoggerService: AppLoggerService,
    private readonly eventNoteService: EventNoteService,
  ) { }

  @Post()
  async create(@Body(ValidationPipe) createEventNoteDto: CreateEventNoteDto) {
    try {
      const eventNote = await this.eventNoteService.create(createEventNoteDto);
      return {
        message: 'Event note created successfully',
        status_code: HttpStatus.CREATED,
        data: {
          event_note: eventNote,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventNoteController.name} - ${this.create.name}`);
    }
  }

  @Get('event/:event_id')
  async findAllByEventId(
    @Query(ValidationPipe) queryEventNoteDto: QueryEventNoteDto,
    @Param('event_id') event_id: string,
  ) {
    try {
      const result = await this.eventNoteService.findAllByEventId(queryEventNoteDto, event_id);
      return {
        message: 'Event notes fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_notes: result.eventNotes,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventNoteController.name} - ${this.findAllByEventId.name}`);
    }
  }


  @UseGuards(JwtAdminGuard)
  @Get()
  async findAll(@Query(ValidationPipe) queryEventNoteDto: QueryEventNoteDto) {
    try {
      const result = await this.eventNoteService.findAll(queryEventNoteDto);
      return {
        message: 'Event notes fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_notes: result.eventNotes,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventNoteController.name} - ${this.findAll.name}`);
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query(ValidationPipe) queryEventNoteDto: QueryEventNoteDto,
  ) {
    try {
      const eventNote = await this.eventNoteService.findOne(
        id,
        queryEventNoteDto.with_event === 'true',
      );
      return {
        message: 'Event note fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_note: eventNote,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventNoteController.name} - ${this.findOne.name}`);
    }
  }

  @UseGuards(JwtAdminGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateEventNoteDto: UpdateEventNoteDto,
  ) {
    try {
      const eventNote = await this.eventNoteService.update(id, updateEventNoteDto);
      return {
        message: 'Event note updated successfully',
        status_code: HttpStatus.OK,
        data: {
          event_note: eventNote,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventNoteController.name} - ${this.update.name}`);
    }
  }


  @UseGuards(JwtAdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const eventNote = await this.eventNoteService.remove(id);
      return {
        message: 'Event note deleted successfully',
        status_code: HttpStatus.OK,
        data: {
          event_note: eventNote,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventNoteController.name} - ${this.remove.name}`);
    }
  }
}
