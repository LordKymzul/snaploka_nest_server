import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventPostAttachmentDto, CreateEventPostDto } from './dto/create-event_post.dto';
import { UpdateEventPostDto } from './dto/update-event_post.dto';
import { QueryEventPostDto } from './dto/query-event_post.dto';
import { EventPostRepository } from './event_post.repository';
import { EventRepository } from '../event/event.repository';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { EventPostEntity } from './entities/event_post.entity';
import { EVENT_ATTACHMENT_STATUS, EVENT_STATUS } from 'src/core/util/constant';
import { EventPostStorageService } from './event_post_storage.service';

@Injectable()
export class EventPostService {

  constructor(
    private readonly dbapp: DbappService,
    private readonly eventPostRepository: EventPostRepository,
    private readonly eventRepository: EventRepository,
    private readonly eventPostStorageService: EventPostStorageService,
  ) { }

  async create(createEventPostDto: CreateEventPostDto) {
    const {
      event_id,
      guest_name,
      content,
      attachments,
    } = createEventPostDto;

    const event = await this.eventRepository.findOneByGuid(event_id);
    const eventInternalId = await this.eventRepository.findInternalIdByGuid(event_id);

    if (event.status !== EVENT_STATUS.ACTIVE) {
      throw new BadRequestException('Event is not active, please contact the administrator');
    }

    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        const { mime_type, file_size_bytes } = attachment;
        const totalStorageBytes = BigInt(event.current_storage_bytes ?? 0) + BigInt(file_size_bytes);

        if (event.max_media_allowed && event.current_media_count >= event.max_media_allowed) {
          throw new BadRequestException('Event has reached the maximum number of media allowed');
        }

        if (event.max_storage_bytes && totalStorageBytes > BigInt(event.max_storage_bytes)) {
          throw new BadRequestException('Storage quota exceeded for this event');
        }

        const presignedData = await this.eventPostStorageService.generateUploadPresignedUrl(event_id, mime_type, file_size_bytes);
        attachment.upload_url = presignedData.upload_url;
        attachment.storage_key = presignedData.storage_key;
      }
    }

    let filteredAttachments: CreateEventPostAttachmentDto[] = [];
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.upload_url && attachment.storage_key) {
          filteredAttachments.push(attachment);
        }
      }
    }

    const id = await this.eventPostRepository.create({
      eventInternalId,
      guest_name,
      content,
      attachments: filteredAttachments.map(attachment => ({
        mime_type: attachment.mime_type,
        file_size_bytes: attachment.file_size_bytes,
        storage_key: attachment.storage_key ?? '',
        upload_url: attachment.upload_url ?? '',
      })),
    });

    return {
      id: id,
      ...(filteredAttachments.length > 0 && { attachments: filteredAttachments }),
    }
  }

  async findAll(queryEventPostDto: QueryEventPostDto) {
    const { eventPosts, total, page, limit } = await this.eventPostRepository.findAll(queryEventPostDto);
    let filteredEventPosts: EventPostEntity[] = [];
    for (const eventPost of eventPosts) {
      if (eventPost.attachments && eventPost.attachments.length > 0) {
        for (const attachment of eventPost.attachments) {
          if (attachment.storage_key) {
            attachment.upload_url = this.eventPostStorageService.getMediaUrl(attachment.storage_key);
          }
        }
      }
      filteredEventPosts.push(eventPost);
    }
    return {
      eventPosts: filteredEventPosts,
      total,
      page,
      limit,
    };
  }

  async findAllByEventId(queryEventPostDto: QueryEventPostDto, event_id: string) {
    const data = await this.findAll({
      ...queryEventPostDto,
      event_id,
    });

    return data;

  }

  async findOne(id: string, withEvent = false): Promise<EventPostEntity> {
    const eventPost = await this.eventPostRepository.findOneByGuid(id, withEvent);
    if (!eventPost) {
      throw new NotFoundException('Event post not found');
    }
    if (eventPost.attachments && eventPost.attachments.length > 0) {
      for (const attachment of eventPost.attachments) {
        if (attachment.storage_key) {
          attachment.storage_key = this.eventPostStorageService.getMediaUrl(attachment.storage_key);
        }
      }
    }

    return eventPost;
  }

  async update(id: string, updateEventPostDto: UpdateEventPostDto) {
    const {
      event_id,
      guest_name,
      content,
    } = updateEventPostDto;

    await this.findOne(id);

    let eventInternalId: number | undefined;
    if (event_id !== undefined) {
      const event = await this.eventRepository.findOneByGuid(event_id);
      eventInternalId = await this.eventRepository.findInternalIdByGuid(event_id);

      if (event.status !== EVENT_STATUS.ACTIVE) {
        throw new BadRequestException('Event is not active, please contact the administrator');
      }
    }

    await this.dbapp.eventPost.update({
      where: { guid: id },
      data: {
        ...(guest_name !== undefined && { guest_name }),
        ...(content !== undefined && { content }),
        ...(eventInternalId !== undefined && { event_id: eventInternalId }),
        updated_at: new Date(),
      },
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<EventPostEntity> {
    return await this.dbapp.$transaction(async (tx) => {
      const existing = await tx.eventPost.findUnique({
        where: { guid: id },
        select: {
          id: true, guid: true, attachments: {
            select: {
              storage_key: true,
            },
          }
        },
      });

      if (!existing) {
        throw new NotFoundException('Event post not found');
      }

      await tx.eventPost.delete({
        where: { guid: id },
      });

      if (existing.attachments && existing.attachments.length > 0) {
        for (const attachment of existing.attachments) {
          if (attachment.storage_key) {
            await this.eventPostStorageService.deleteMedia(attachment.storage_key);
          }
        }
      }

      return EventPostEntity.fromDBApplication({
        id: existing.guid,
      });
    });
  }

  async confirmUpload(eventPostId: string): Promise<EventPostEntity> {
    const eventPost = await this.eventPostRepository.findOneByGuid(eventPostId);
    if (!eventPost) {
      throw new NotFoundException('Event post not found');
    }

    const pendingAttachments = (eventPost.attachments ?? []).filter(
      (attachment) => attachment.status === EVENT_ATTACHMENT_STATUS.PENDING,
    );
    if (pendingAttachments.length === 0) {
      throw new BadRequestException('Event post attachments are not pending');
    }

    const eventInternalId = await this.eventRepository.findInternalIdByGuid(eventPost.event_id);
    if (!eventInternalId) {
      throw new NotFoundException('Event not found');
    }

    const totalFileSizeBytes = pendingAttachments.reduce(
      (total, attachment) => total + BigInt(attachment.file_size_bytes),
      BigInt(0),
    );

    return await this.dbapp.$transaction(async (tx) => {
      const updatedEventAttachments = await tx.$queryRaw<any[]>`
        UPDATE event_attachments SET
          status = ${EVENT_ATTACHMENT_STATUS.APPROVED},
          updated_at = NOW()
        WHERE event_post_id = (
          SELECT id FROM event_posts WHERE guid = ${eventPostId}
        )
        AND status = ${EVENT_ATTACHMENT_STATUS.PENDING}
        RETURNING
          guid as id,
          mime_type,
          storage_key,
          file_size_bytes,
          status
      `;

      if (!updatedEventAttachments || updatedEventAttachments.length === 0) {
        throw new BadRequestException('Failed to update event attachments');
      }

      await tx.$queryRaw`
        UPDATE events SET
          current_media_count = current_media_count + ${updatedEventAttachments.length},
          current_storage_bytes = current_storage_bytes + ${totalFileSizeBytes}::bigint,
          updated_at = NOW()
        WHERE id = ${eventInternalId}
      `;

      return EventPostEntity.fromDBApplication({
        id: eventPost.id,
        attachments: updatedEventAttachments.map((attachment) => ({
          ...attachment,
          file_size_bytes: Number(attachment.file_size_bytes),
        })),
      });
    });
  }
}

