import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AppLoggerService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) { }

    info(message: string, meta?: Record<string, unknown>, context?: string) {
        this.logger.info(message, { ...meta, context });
    }

    debug(message: string | Record<string, unknown>, context?: string) {
        if (typeof message === 'string') {
            this.logger.debug({ message, context });
        } else {
            this.logger.debug({ ...message, context });
        }
    }

    error(error: unknown, context?: string) {
        if (error instanceof Error) {
            this.logger.error({ message: error.stack, context });
            return;
        }

        this.logger.error({ message: String(error), context });
    }

    warn(message: string, meta?: Record<string, unknown>, context?: string) {
        this.logger.warn(message, { ...meta, context });
    }
}