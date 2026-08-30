import { Test, TestingModule } from '@nestjs/testing';
import { EventPackageController } from './event_package.controller';
import { EventPackageService } from './event_package.service';

describe('EventPackageController', () => {
  let controller: EventPackageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventPackageController],
      providers: [EventPackageService],
    }).compile();

    controller = module.get<EventPackageController>(EventPackageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
