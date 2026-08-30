import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_NAMES } from 'src/core/util/constant';
import { LoginAttemptService } from '../login_attempt/login_attempt.service';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { LoginEvent } from './event/login-event';


@Injectable()
export class AuthListener {




    constructor(
        private readonly appLoggerService: AppLoggerService,
        private readonly prisma: DbappService,
        private readonly loginAttemptService: LoginAttemptService
    ) { }

    @OnEvent(EVENT_NAMES.LOGIN)
    async handleLoginEvent(payload: LoginEvent) {
        const { signInDto, userId, ipAddress, userAgent, isSuccess, failureReason } = payload;

        const { email } = signInDto;

        this.appLoggerService.info(`Handling login event for email ${email}`, { userId, ipAddress, userAgent, isSuccess, failureReason }, `${AuthListener.name} - ${this.handleLoginEvent.name}`);

        let metadata: Record<string, any> = {
            email: email,
        };

        if (ipAddress) {
            metadata.ip_address = ipAddress;
        }
        if (userAgent) {
            metadata.user_agent = userAgent;
        }

        const [loginAttempt, user] = await Promise.allSettled([
            this.loginAttemptService.create({
                email_attempted: email,
                ip_address: ipAddress,
                user_agent: userAgent,
                metadata: metadata,
                is_success: isSuccess,
                failure_reason: failureReason ?? undefined,
                user_id: userId ?? undefined,
            }),
            this.prisma.user.findUnique({
                where: { email: email },
            }),
        ]);

        if (loginAttempt.status === 'rejected') {
            this.appLoggerService.error(
                `Failed to create login attempt for email ${email}: ${loginAttempt.reason instanceof Error ? loginAttempt.reason.message : String(loginAttempt.reason)}`
            );
            return;
        }

        if (user.status === 'rejected') {
            this.appLoggerService.error(
                `Failed to find user for email ${email}: ${user.reason instanceof Error ? user.reason.message : String(user.reason)}`
            );
            return;
        }

        // Optionally: do other things here with loginAttempt.value and user.value if needed


    }


}