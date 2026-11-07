import { Test, TestingModule } from '@nestjs/testing';
import { EventBankAccountController } from './event_bank_account.controller';
import { EventBankAccountService } from './event_bank_account.service';

describe('EventBankAccountController', () => {
  let controller: EventBankAccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventBankAccountController],
      providers: [EventBankAccountService],
    }).compile();

    controller = module.get<EventBankAccountController>(EventBankAccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
