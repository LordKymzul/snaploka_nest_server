import { Test, TestingModule } from '@nestjs/testing';
import { LoginAttemptController } from './login_attempt.controller';
import { LoginAttemptService } from './login_attempt.service';

describe('LoginAttemptController', () => {
  let controller: LoginAttemptController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginAttemptController],
      providers: [LoginAttemptService],
    }).compile();

    controller = module.get<LoginAttemptController>(LoginAttemptController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
