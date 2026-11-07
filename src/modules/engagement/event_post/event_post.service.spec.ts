import { Test, TestingModule } from '@nestjs/testing';
import { EventPostService } from './event_post.service';

describe('EventPostService', () => {
  let service: EventPostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventPostService],
    }).compile();

    service = module.get<EventPostService>(EventPostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
