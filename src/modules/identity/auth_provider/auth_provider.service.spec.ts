import { Test, TestingModule } from '@nestjs/testing';
import { AuthProviderService } from './auth_provider.service';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { AuthProviderRepository } from './auth_provider.repository';

describe('AuthProviderService', () => {
  let service: AuthProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthProviderService,
        {
          provide: DbappService,
          useValue: {
            authProvider: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            $queryRaw: jest.fn(),
            $queryRawUnsafe: jest.fn(),
            $transaction: jest.fn(),
          },
        },
        {
          provide: AuthProviderRepository,
          useValue: {
            findOneByGuid: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthProviderService>(AuthProviderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
