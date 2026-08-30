import { Test, TestingModule } from '@nestjs/testing';
import { DbappService } from './dbapp.service';

describe('DbappService', () => {
  let service: DbappService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbappService],
    }).compile();

    service = module.get<DbappService>(DbappService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
