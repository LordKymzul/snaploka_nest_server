import { Test, TestingModule } from '@nestjs/testing';
import { DbappController } from './dbapp.controller';
import { DbappService } from './dbapp.service';

describe('DbappController', () => {
  let controller: DbappController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DbappController],
      providers: [DbappService],
    }).compile();

    controller = module.get<DbappController>(DbappController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
