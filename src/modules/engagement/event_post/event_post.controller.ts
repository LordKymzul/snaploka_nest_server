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
import { EventPostService } from './event_post.service';
import { CreateEventPostDto } from './dto/create-event_post.dto';
import { UpdateEventPostDto } from './dto/update-event_post.dto';
import { QueryEventPostDto } from './dto/query-event_post.dto';
import { getPagination, handleError } from 'src/core/util/helper';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';
import { JwtAdminGuard } from 'src/core/shared/guard/jwt-admin.guard';

@ApiBearerAuth()
@ApiTags('Engagement - Event Posts')
@Controller('event-post')
export class EventPostController {
  constructor(
    private readonly appLoggerService: AppLoggerService,
    private readonly eventPostService: EventPostService,
  ) { }

  @Post()
  async create(@Body(ValidationPipe) createEventPostDto: CreateEventPostDto) {
    try {
      const eventPost = await this.eventPostService.create(createEventPostDto);
      return {
        message: 'Event post created successfully',
        status_code: HttpStatus.CREATED,
        data: {
          event_post: eventPost,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventPostController.name} - ${this.create.name}`);
    }
  }

  @Post(':id/confirm-upload')
  async confirmUpload(@Param('id') id: string) {
    try {
      const eventPost = await this.eventPostService.confirmUpload(id);
      return {
        message: 'Event post uploaded successfully',
        status_code: HttpStatus.OK,
        data: {
          event_post: eventPost,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventPostController.name} - ${this.confirmUpload.name}`);
    }
  }

  @Get('event/:event_id')
  async findAllByEventId(
    @Query(ValidationPipe) queryEventPostDto: QueryEventPostDto,
    @Param('event_id') event_id: string,
  ) {
    try {
      const result = await this.eventPostService.findAllByEventId(queryEventPostDto, event_id);
      return {
        message: 'Event posts fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_posts: result.eventPosts,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventPostController.name} - ${this.findAllByEventId.name}`);
    }
  }

  @Get()
  async findAll(@Query(ValidationPipe) queryEventPostDto: QueryEventPostDto) {
    try {
      const result = await this.eventPostService.findAll(queryEventPostDto);
      return {
        message: 'Event posts fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_posts: result.eventPosts,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventPostController.name} - ${this.findAll.name}`);
    }
  }

  @UseGuards(JwtAdminGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query(ValidationPipe) queryEventPostDto: QueryEventPostDto,
  ) {
    try {
      const eventPost = await this.eventPostService.findOne(
        id,
        queryEventPostDto.with_event === 'true',
      );
      return {
        message: 'Event post fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_post: eventPost,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventPostController.name} - ${this.findOne.name}`);
    }
  }

  @UseGuards(JwtAdminGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateEventPostDto: UpdateEventPostDto,
  ) {
    try {
      const eventPost = await this.eventPostService.update(id, updateEventPostDto);
      return {
        message: 'Event post updated successfully',
        status_code: HttpStatus.OK,
        data: {
          event_post: eventPost,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventPostController.name} - ${this.update.name}`);
    }
  }

  @UseGuards(JwtAdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const eventPost = await this.eventPostService.remove(id);
      return {
        message: 'Event post deleted successfully',
        status_code: HttpStatus.OK,
        data: {
          event_post: eventPost,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventPostController.name} - ${this.remove.name}`);
    }
  }
}
