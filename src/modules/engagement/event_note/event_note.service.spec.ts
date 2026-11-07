import { Test, TestingModule } from '@nestjs/testing';
import { EventNoteService } from './event_note.service';

describe('EventNoteService', () => {
  let service: EventNoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventNoteService],
    }).compile();

    service = module.get<EventNoteService>(EventNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
