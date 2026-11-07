import { Test, TestingModule } from '@nestjs/testing';
import { EventNoteController } from './event_note.controller';
import { EventNoteService } from './event_note.service';

describe('EventNoteController', () => {
  let controller: EventNoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventNoteController],
      providers: [EventNoteService],
    }).compile();

    controller = module.get<EventNoteController>(EventNoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
