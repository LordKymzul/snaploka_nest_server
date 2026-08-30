import { Test, TestingModule } from '@nestjs/testing';
import { EventMediaController } from './event_media.controller';
import { EventMediaService } from './event_media.service';

describe('EventMediaController', () => {
  let controller: EventMediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventMediaController],
      providers: [EventMediaService],
    }).compile();

    controller = module.get<EventMediaController>(EventMediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
