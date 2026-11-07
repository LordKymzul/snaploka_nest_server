import { Test, TestingModule } from '@nestjs/testing';
import { EventPostController } from './event_post.controller';
import { EventPostService } from './event_post.service';

describe('EventPostController', () => {
  let controller: EventPostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventPostController],
      providers: [EventPostService],
    }).compile();

    controller = module.get<EventPostController>(EventPostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
