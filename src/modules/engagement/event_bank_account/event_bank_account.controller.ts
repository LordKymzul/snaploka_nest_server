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
import { EventBankAccountService } from './event_bank_account.service';
import { CreateEventBankAccountDto } from './dto/create-event_bank_account.dto';
import { UpdateEventBankAccountDto } from './dto/update-event_bank_account.dto';
import { QueryEventBankAccountDto } from './dto/query-event_bank_account.dto';
import { getPagination, handleError } from 'src/core/util/helper';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';
import { JwtAdminGuard } from 'src/core/shared/guard/jwt-admin.guard';

@ApiBearerAuth()
@ApiTags('Engagement - Event Bank Accounts')
@Controller('event-bank-account')
export class EventBankAccountController {
  constructor(
    private readonly appLoggerService: AppLoggerService,
    private readonly eventBankAccountService: EventBankAccountService,
  ) { }

  @Post()
  async create(@Body(ValidationPipe) createEventBankAccountDto: CreateEventBankAccountDto) {
    try {
      const eventBankAccount = await this.eventBankAccountService.create(createEventBankAccountDto);
      return {
        message: 'Event bank account created successfully',
        status_code: HttpStatus.CREATED,
        data: {
          event_bank_account: eventBankAccount,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventBankAccountController.name} - ${this.create.name}`);
    }
  }

  @Get('event/:event_id')
  async findAllByEventId(
    @Query(ValidationPipe) queryEventBankAccountDto: QueryEventBankAccountDto,
    @Param('event_id') event_id: string,
  ) {
    try {
      const result = await this.eventBankAccountService.findAllByEventId(queryEventBankAccountDto, event_id);
      return {
        message: 'Event bank accounts fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_bank_accounts: result.bankAccounts,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventBankAccountController.name} - ${this.findAllByEventId.name}`);
    }
  }

  @Get()
  async findAll(@Query(ValidationPipe) queryEventBankAccountDto: QueryEventBankAccountDto) {
    try {
      const result = await this.eventBankAccountService.findAll(queryEventBankAccountDto);
      return {
        message: 'Event bank accounts fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_bank_accounts: result.bankAccounts,
          pagination: getPagination(result.page, result.limit, result.total),
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventBankAccountController.name} - ${this.findAll.name}`);
    }
  }

  @UseGuards(JwtAdminGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query(ValidationPipe) queryEventBankAccountDto: QueryEventBankAccountDto,
  ) {
    try {
      const eventBankAccount = await this.eventBankAccountService.findOne(
        id,
        queryEventBankAccountDto.with_event === 'true',
      );
      return {
        message: 'Event bank account fetched successfully',
        status_code: HttpStatus.OK,
        data: {
          event_bank_account: eventBankAccount,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventBankAccountController.name} - ${this.findOne.name}`);
    }
  }

  @UseGuards(JwtAdminGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateEventBankAccountDto: UpdateEventBankAccountDto,
  ) {
    try {
      const eventBankAccount = await this.eventBankAccountService.update(id, updateEventBankAccountDto);
      return {
        message: 'Event bank account updated successfully',
        status_code: HttpStatus.OK,
        data: {
          event_bank_account: eventBankAccount,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventBankAccountController.name} - ${this.update.name}`);
    }
  }

  @UseGuards(JwtAdminGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const eventBankAccount = await this.eventBankAccountService.remove(id);
      return {
        message: 'Event bank account deleted successfully',
        status_code: HttpStatus.OK,
        data: {
          event_bank_account: eventBankAccount,
        },
      };
    } catch (error) {
      handleError(error, this.appLoggerService, `${EventBankAccountController.name} - ${this.remove.name}`);
    }
  }
}
