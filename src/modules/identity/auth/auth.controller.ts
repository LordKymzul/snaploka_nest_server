import {
  Controller,
  Post,
  Body,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  ForbiddenException,
  HttpStatus,
  ConflictException,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { ApiTags } from '@nestjs/swagger';
import { ClientInfo, GetClientInfo, handleError } from 'src/core/util/helper';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';
import { log } from 'console';
import { RefreshJwtGuard } from 'src/core/shared/guard/refresh-jwt.guard';
import { AdminSignUpDto } from './dto/admin-sign-up.dto';


@ApiTags('Identity - Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: AppLoggerService,
  ) { }



  @Post('admin/register')
  async signUpAdmin(@Body(ValidationPipe) adminSignUpDto: AdminSignUpDto) {
    try {
      const data = await this.authService.signUpAdmin(adminSignUpDto);
      return {
        message: 'Admin registration successful',
        status_code: HttpStatus.OK,
        data: {
          user: data.user,
          backend_token: data.backendToken,
        },
      };
    }
    catch (error) {
      handleError(error, this.logger, AuthController.name);
    }
  }

  @Post('register')
  async signUp(@Body() signUpDto: SignUpDto) {
    try {
      const data = await this.authService.signUp(signUpDto);
      const { backendToken, user } = data;
      return {
        message: 'Registration successful',
        status_code: HttpStatus.OK,
        data: {
          user: user,
          backend_token: backendToken,
        },
      };
    } catch (error) {
      handleError(error, this.logger, AuthController.name);
    }
  }

  @Post('login')
  async signIn(
    @Body() signInDto: SignInDto,
    @GetClientInfo() clientInfo: ClientInfo,
  ) {
    try {
      const data = await this.authService.signIn(signInDto, clientInfo);
      const { backendToken } = data;
      return {
        message: 'Login successful',
        status_code: HttpStatus.OK,
        data: {
          user: data.user,
          backend_token: backendToken,
        },
      };
    } catch (error) {
      handleError(error, this.logger, AuthController.name);
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      const data = await this.authService.forgotPassword(forgotPasswordDto);
      return {
        message: 'Forgot password successful',
        status_code: HttpStatus.OK,
        data: {
          token: data.token,
          expires_at: data.expires_at,
        },
      };
    }
    catch (error) {
      handleError(error, this.logger, AuthController.name);
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      const data = await this.authService.resetPassword(resetPasswordDto);

      return {
        message: 'Reset password successful',
        status_code: HttpStatus.OK,
        data: {
          ...data
        },
      };
    }
    catch (error) {
      handleError(error, this.logger, AuthController.name);
    }
  }


  @UseGuards(RefreshJwtGuard)
  @Post('refresh-token')
  async refreshToken(@Req() req: Request) {
    try {
      const user = req['user'] as any;
      const result = await this.authService.refreshToken(user);

      return {
        message: 'Refresh token successful',
        status_code: HttpStatus.OK,
        data: {
          user: result.user,
          backend_token: result.backendToken,
        },
      };
    } catch (error) {
      handleError(error, this.logger, AuthController.name);
    }
  }



}