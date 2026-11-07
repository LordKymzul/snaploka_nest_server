import { Test, TestingModule } from '@nestjs/testing';
import { EventBankAccountService } from './event_bank_account.service';

describe('EventBankAccountService', () => {
  let service: EventBankAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventBankAccountService],
    }).compile();

    service = module.get<EventBankAccountService>(EventBankAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
