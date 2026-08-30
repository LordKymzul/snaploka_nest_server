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
import { EventMediaService } from './event_media.service';
import { CreateEventMediaDto } from './dto/create-event_media.dto';
import { UpdateEventMediaDto } from './dto/update-event_media.dto';
import { QueryEventMediaDto } from './dto/query-event_media.dto';
import { getPagination, handleError } from 'src/core/util/helper';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';
import { PresignedUrlRequestDto } from './dto/presigned-url-request.dto';
import { ConfirmUploadRequestDto } from './dto/confirm-upload-request.dto';
import { JwtAdminGuard } from 'src/core/shared/guard/jwt-admin.guard';

@ApiBearerAuth()
@ApiTags('Engagement - Event Media')
@Controller('event-media')
export class EventMediaController {
  constructor(
    private readonly appLoggerService: AppLoggerService,
    private readonly eventMediaService: EventMediaService,
  ) { }

  @Post('presigned-url')
  async getPresignedUrl(@Body(ValidationPipe) presignedUrlRequestDto: PresignedUrlRequestDto) {
    try {
      const presignedUrl = await this.eventMediaService.getPresignedUrl(presignedUrlRequestDto);
      return {
        message: 'Presigned url generated successfully',
        status_code: HttpStatus.OK,
        data: {
          upload_url: presignedUrl.upload_url,
          storage_key: presignedUrl.storage_key,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventMediaController.name} - ${this.getPresignedUrl.name}`);
    }
  }

  @Post('confirm-upload')
  async confirmUpload(@Body(ValidationPipe) confirmUploadRequestDto: ConfirmUploadRequestDto) {
    try {
      const eventMedia = await this.eventMediaService.confirmUpload(confirmUploadRequestDto.event_media_id);
      return {
        message: 'Event media confirmed successfully',
        status_code: HttpStatus.OK,
        data: {
          event_media: eventMedia,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventMediaController.name} - ${this.confirmUpload.name}`);
    }
  }

  @Post()
  async create(@Body(ValidationPipe) createEventMediaDto: CreateEventMediaDto) {
    try {
      const eventMedia = await this.eventMediaService.create(createEventMediaDto);
      return {
        message: 'Event media created successfully',
        status_code: HttpStatus.CREATED,
        data: {
          event_media: eventMedia,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventMediaController.name} - ${this.create.name}`);
    }
  }

  @Get('event/:event_id')
  async findAllByEventId(@Query(ValidationPipe) queryEventMediaDto: QueryEventMediaDto, @Param('event_id') event_id: string) {
    try {
      const result = await this.eventMediaService.findAllByEventId(queryEventMediaDto, event_id);
      return {
        message: 'Event media fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_media: result.eventMedia,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventMediaController.name} - ${this.findAllByEventId.name}`);
    }
  }

  @UseGuards(JwtAdminGuard)
  @Get()
  async findAll(@Query(ValidationPipe) queryEventMediaDto: QueryEventMediaDto) {
    try {
      const result = await this.eventMediaService.findAll(queryEventMediaDto);
      return {
        message: 'Event media fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_media: result.eventMedia,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventMediaController.name} - ${this.findAll.name}`);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const eventMedia = await this.eventMediaService.findOne(id);
      return {
        message: 'Event media fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_media: eventMedia,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventMediaController.name} - ${this.findOne.name}`);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateEventMediaDto: UpdateEventMediaDto,
  ) {
    try {
      const eventMedia = await this.eventMediaService.update(id, updateEventMediaDto);
      return {
        message: 'Event media updated successfully',
        status_code: HttpStatus.OK,
        data: {
          event_media: eventMedia,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventMediaController.name} - ${this.update.name}`);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const eventMedia = await this.eventMediaService.remove(id);
      return {
        message: 'Event media deleted successfully',
        status_code: HttpStatus.OK,
        data: {
          event_media: eventMedia,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventMediaController.name} - ${this.remove.name}`);
    }
  }
}
