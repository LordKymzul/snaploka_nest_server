import { Test, TestingModule } from '@nestjs/testing';
import { AuthProviderController } from './auth_provider.controller';
import { AuthProviderService } from './auth_provider.service';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';

describe('AuthProviderController', () => {
  let controller: AuthProviderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthProviderController],
      providers: [
        {
          provide: AuthProviderService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: AppLoggerService,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthProviderController>(AuthProviderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
