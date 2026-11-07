import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateEventBankAccountDto } from './dto/create-event_bank_account.dto';
import { UpdateEventBankAccountDto } from './dto/update-event_bank_account.dto';
import { QueryEventBankAccountDto } from './dto/query-event_bank_account.dto';
import { EventBankAccountRepository } from './event_bank_account.repository';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { EventRepository } from '../event/event.repository';
import { EventBankAccountEntity } from './entities/event_bank_account.entity';
import { EVENT_STATUS } from 'src/core/util/constant';
import { EventBankAccountStorageService } from './event_bank_account_storage.service';

@Injectable()
export class EventBankAccountService {

  private readonly logger = new Logger(EventBankAccountService.name);
  constructor(
    private readonly dbapp: DbappService,
    private readonly eventBankAccountRepository: EventBankAccountRepository,
    private readonly eventRepository: EventRepository,
    private readonly eventBankAccountStorageService: EventBankAccountStorageService,
  ) { }

  async create(createEventBankAccountDto: CreateEventBankAccountDto) {
    const {
      event_id,
      bank_name,
      account_number,
      account_holder_name,
      qr_image_mime_type,
      qr_image_file_size,
      metadata,
      type,
    } = createEventBankAccountDto;

    const eventInternalId = await this.eventRepository.findInternalIdByGuid(event_id);

    const existingEventBankAccount = await this.eventBankAccountRepository.findOneByEventIdAndType(eventInternalId, type);
    if (existingEventBankAccount) {
      throw new ConflictException('A bank account already exists for this event');
    }

    const tempGuid = crypto.randomUUID();
    let uploadUrl: string | null = null;
    let storageKey: string | null = null;

    if (qr_image_mime_type && qr_image_file_size) {
      const presignedData = await this.eventBankAccountStorageService.generateUploadPresignedUrl(
        tempGuid,
        qr_image_mime_type,
        qr_image_file_size,
      );
      uploadUrl = presignedData.upload_url;
      storageKey = presignedData.storage_key;

      if (!uploadUrl || !storageKey) {
        throw new BadRequestException('Failed to generate upload presigned url');
      }
    }

    const id = await this.eventBankAccountRepository.create({
      eventInternalId,
      bank_name,
      account_number,
      account_holder_name,
      qr_image_storage_key: storageKey,
      metadata: metadata ?? null,
      type,
    });

    return {
      id,
      ...(uploadUrl && { upload_url: uploadUrl, storage_key: storageKey }),
    };
  }

  async findAll(queryEventBankAccountDto: QueryEventBankAccountDto) {
    const result = await this.eventBankAccountRepository.findAll(queryEventBankAccountDto);
    const formattedBankAccounts = result.eventBankAccounts.map((item) => {
      const eventBankAccountEntity = EventBankAccountEntity.fromDBApplication(item);
      if (item.qr_image_storage_key) {
        eventBankAccountEntity.qr_image_url = this.eventBankAccountStorageService.getMediaUrl(item.qr_image_storage_key);
      }
      return eventBankAccountEntity;
    });
    return {
      total: result.total,
      bankAccounts: formattedBankAccounts,
      page: result.page,
      limit: result.limit,
    };
  }

  async findAllByEventId(queryEventBankAccountDto: QueryEventBankAccountDto, event_id: string) {
    let formattedBankAccounts: EventBankAccountEntity[] = [];
    const result = await this.findAll({
      ...queryEventBankAccountDto,
      event_id,
    });
    for (const item of result.bankAccounts) {
      const {
        qr_image_storage_key,
        metadata,
        is_active,
        created_at,
        updated_at,
        ...rest
      } = item;
      formattedBankAccounts.push(EventBankAccountEntity.fromDBApplication(rest));
    }
    return {
      total: result.total,
      bankAccounts: formattedBankAccounts,
      page: result.page,
      limit: result.limit,
    };
  }

  async findOne(id: string, withEvent = false): Promise<EventBankAccountEntity> {
    const eventBankAccount = await this.eventBankAccountRepository.findOneByGuid(id, withEvent);
    if (!eventBankAccount) {
      throw new NotFoundException('Event bank account not found');
    }
    if (eventBankAccount.qr_image_storage_key) {
      eventBankAccount.qr_image_url = this.eventBankAccountStorageService.getMediaUrl(eventBankAccount.qr_image_storage_key);
    }
    return eventBankAccount;
  }

  async update(id: string, updateEventBankAccountDto: UpdateEventBankAccountDto) {
    const {
      event_id,
      bank_name,
      account_number,
      account_holder_name,
      metadata,
      is_active,
      qr_image_mime_type,
      qr_image_file_size,
      type,
    } = updateEventBankAccountDto;

    const existingEventBankAccount = await this.findOne(id);

    if (!existingEventBankAccount) {
      throw new NotFoundException('Event bank account not found');
    }

    let eventInternalId: number | undefined;
    if (event_id !== undefined) {
      const event = await this.eventRepository.findOneByGuid(event_id);
      eventInternalId = await this.eventRepository.findInternalIdByGuid(event_id);

      if (event.status !== EVENT_STATUS.ACTIVE) {
        throw new BadRequestException('Event is not active, please contact the administrator');
      }

    }

    let uploadUrl: string | null = null;
    let storageKey: string | null = null;

    if (qr_image_mime_type && qr_image_file_size) {
      try {
        const presignedData = await this.eventBankAccountStorageService.generateUploadPresignedUrl(
          id,
          qr_image_mime_type,
          qr_image_file_size,
        );
        uploadUrl = presignedData.upload_url;
        storageKey = presignedData.storage_key;
        if (uploadUrl && storageKey && existingEventBankAccount.qr_image_storage_key) {
          try {
            await this.eventBankAccountStorageService.deleteMedia(existingEventBankAccount.qr_image_storage_key);
          } catch (error) {
            this.logger.error(`Failed to delete existing QR image: ${error}`);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to generate upload presigned url: ${error}`);
        throw new BadRequestException('Failed to generate upload presigned url');
      }
    }


    await this.dbapp.eventBankAccount.update({
      where: { guid: id },
      data: {
        ...(bank_name !== undefined && { bank_name }),
        ...(account_number !== undefined && { account_number }),
        ...(account_holder_name !== undefined && { account_holder_name }),
        ...(metadata !== undefined && { metadata: metadata as Prisma.InputJsonValue }),
        ...(is_active !== undefined && { is_active }),
        ...(eventInternalId !== undefined && { event_id: eventInternalId }),
        ...(storageKey !== null && { qr_image_storage_key: storageKey }),
        ...(type !== undefined && { type }),
        updated_at: new Date(),
      },
    });

    return {
      id,
      ...(uploadUrl && { upload_url: uploadUrl, storage_key: storageKey }),
    }
  }

  async remove(id: string): Promise<EventBankAccountEntity> {
    return await this.dbapp.$transaction(async (tx) => {
      const existing = await tx.eventBankAccount.findUnique({
        where: { guid: id },
        select: { id: true, guid: true, qr_image_storage_key: true },
      });
      if (!existing) {
        throw new NotFoundException('Event bank account not found');
      }

      await tx.eventBankAccount.delete({
        where: { guid: id },
        select: { qr_image_storage_key: true },
      });

      if (existing.qr_image_storage_key) {
        try {
          await this.eventBankAccountStorageService.deleteMedia(existing.qr_image_storage_key);
        } catch (error) {
          this.logger.error(`Failed to delete QR image: ${error}`);
        }
      }

      return EventBankAccountEntity.fromDBApplication({
        id: existing.guid,
      });
    });
  }
}
