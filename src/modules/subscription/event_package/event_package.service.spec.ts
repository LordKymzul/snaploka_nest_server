import { Test, TestingModule } from '@nestjs/testing';
import { EventPackageService } from './event_package.service';

describe('EventPackageService', () => {
  let service: EventPackageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventPackageService],
    }).compile();

    service = module.get<EventPackageService>(EventPackageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
