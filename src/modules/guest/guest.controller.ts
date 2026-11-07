import { Body, Controller, Get, HttpStatus, Param, Post, Query, ValidationPipe } from '@nestjs/common';
import { GuestService } from './guest.service';
import { EventGuestEntity } from './entities/event-guest.entity';
import { getPagination, handleError } from 'src/core/util/helper';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';
import { ApiTags } from '@nestjs/swagger';
import { QueryEventMediaGuestDto } from './dto/query-event-media-guest.dto';
import { QueryEventNoteGuestDto } from './dto/query-event-note-guest.dto';
import { EventMediaService } from '../engagement/event_media/event_media.service';
import { PresignedUrlRequestDto } from '../engagement/event_media/dto/presigned-url-request.dto';
import { ConfirmUploadRequestDto } from '../engagement/event_media/dto/confirm-upload-request.dto';
import { CreateEventNoteDto } from '../engagement/event_note/dto/create-event_note.dto';
import { QueryEventBankAccountGuestDto } from './dto/query-event-bank-account-guest.dto';
import { CreateEventPostGuestDto } from './dto/create-event-post-guest.dto';
import { QueryEventPostGuestDto } from './dto/query-event-post-quest.dto';

@ApiTags('Guest')
@Controller('guests')
export class GuestController {
  constructor(
    private readonly guestService: GuestService,
    private readonly appLoggerService: AppLoggerService,
    private readonly eventMediaService: EventMediaService,
  ) { }

  @Get(':eventId/events')
  async getEventById(@Param('eventId') eventId: string) {
    try {
      const event = await this.guestService.getEventById(eventId);
      return {
        message: 'Event fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${GuestController.name} - ${this.getEventById.name}`);
    }
  }

  @Get(':eventId/media')
  async findAllEventMedia(
    @Query(ValidationPipe) queryEventMediaGuestDto: QueryEventMediaGuestDto,
    @Param('eventId') eventId: string,
  ) {
    try {
      const eventMedia = await this.guestService.findAllEventMedia({
        ...queryEventMediaGuestDto,
        event_id: eventId,
      });
      return {
        message: 'Event media list fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_media: eventMedia.eventMedia,
          pagination: getPagination(eventMedia.page, eventMedia.limit, eventMedia.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${GuestController.name} - ${this.findAllEventMedia.name}`);
    }
  }


  @Get('media/:mediaId')
  async findOneEventMedia(@Param('mediaId') mediaId: string) {
    try {
      const eventMedia = await this.guestService.findOneEventMedia(mediaId);
      return {
        message: 'Event media fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_media: eventMedia,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${GuestController.name} - ${this.findOneEventMedia.name}`);
    }
  }

  @Get(':eventId/notes')
  async findAllEventNotes(
    @Query(ValidationPipe) queryEventNoteGuestDto: QueryEventNoteGuestDto,
    @Param('eventId') eventId: string,
  ) {
    try {
      const eventNotes = await this.guestService.findAllEventNotes({
        ...queryEventNoteGuestDto,
        event_id: eventId,
      });
      return {
        message: 'Event notes fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_notes: eventNotes.eventNotes,
          pagination: getPagination(eventNotes.page, eventNotes.limit, eventNotes.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${GuestController.name} - ${this.findAllEventNotes.name}`);
    }
  }

  @Get('notes/:noteId')
  async findOneEventNote(@Param('noteId') noteId: string) {
    try {
      const eventNote = await this.guestService.findOneEventNote(noteId);
      return {
        message: 'Event note fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_note: eventNote,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${GuestController.name} - ${this.findOneEventNote.name}`);
    }
  }

  @Get(':eventId/bank-accounts')
  async findAllEventBankAccounts(
    @Query(ValidationPipe) queryEventBankAccountGuestDto: QueryEventBankAccountGuestDto,
    @Param('eventId') eventId: string,
  ) {
    try {
      const eventBankAccounts = await this.guestService.findAllEventBankAccounts({
        ...queryEventBankAccountGuestDto,
        event_id: eventId,
      });
      return {
        message: 'Event bank accounts fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_bank_accounts: eventBankAccounts.bankAccounts,
          pagination: getPagination(eventBankAccounts.page, eventBankAccounts.limit, eventBankAccounts.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${GuestController.name} - ${this.findAllEventBankAccounts.name}`);
    }
  }

  @Get(':eventId/posts')
  async findAllEventPosts(
    @Query(ValidationPipe) queryEventPostGuestDto: QueryEventPostGuestDto,
    @Param('eventId') eventId: string,
  ) {
    try {
      const eventPosts = await this.guestService.findAllEventPosts({
        ...queryEventPostGuestDto,
        event_id: eventId,
      });
      return {
        message: 'Event posts fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_posts: eventPosts.eventPosts,
          pagination: getPagination(eventPosts.page, eventPosts.limit, eventPosts.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${GuestController.name} - ${this.findAllEventPosts.name}`);
    }
  }

  @Post('media/presigned-url')
  async getPresignedUrl(@Body(ValidationPipe) presignedUrlRequestDto: PresignedUrlRequestDto) {
    try {
      const presignedUrl = await this.eventMediaService.getPresignedUrl(presignedUrlRequestDto);
      return {
        message: 'Presigned url generated successfully',
        status_code: HttpStatus.OK,
        data: {
          upload_url: presignedUrl.upload_url,
          storage_key: presignedUrl.storage_key,
          event_media_id: presignedUrl.event_media_id,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${GuestController.name} - ${this.getPresignedUrl.name}`);
    }
  }

  @Post('media/:mediaId/confirm-upload')
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
      handleError(error, this.appLoggerService, `${GuestController.name} - ${this.confirmUpload.name}`);
    }
  }

  @Post('notes')
  async createEventNote(@Body(ValidationPipe) createEventNoteDto: CreateEventNoteDto) {
    try {
      const eventNote = await this.guestService.createEventNote(createEventNoteDto);
      return {
        message: 'Event note created successfully',
        status_code: HttpStatus.CREATED,
        data: {
          event_note: eventNote,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${GuestController.name} - ${this.createEventNote.name}`);
    }
  }

  @Post('posts')
  async createEventPost(@Body(ValidationPipe) createEventPostDto: CreateEventPostGuestDto) {
    try {
      const eventPost = await this.guestService.createEventPost(createEventPostDto);
      return {
        message: 'Event post created successfully',
        status_code: HttpStatus.CREATED,
        data: {
          event_post: eventPost,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${GuestController.name} - ${this.createEventPost.name}`);
    }
  }
  @Post('posts/:id/confirm-upload')
  async confirmUploadEventPost(@Param('id') id: string) {
    try {
      const eventPost = await this.guestService.confirmUploadEventPost(id);
      return {
        message: 'Event post confirmed successfully',
        status_code: HttpStatus.OK,
        data: {
          event_post: eventPost,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${GuestController.name} - ${this.confirmUploadEventPost.name}`);
    }
  }




}
