import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { UserRepository } from './user.repository';
import { AuthProviderRepository } from '../auth_provider/auth_provider.repository';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DbappService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            $queryRaw: jest.fn(),
            $queryRawUnsafe: jest.fn(),
            $transaction: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            findByGuid: jest.fn(),
            findInternalIdByGuid: jest.fn(),
          },
        },
        {
          provide: AuthProviderRepository,
          useValue: {
            findInternalIdByName: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
