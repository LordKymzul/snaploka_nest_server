import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { AppLoggerService } from './app-logger/app-logger.service';
import * as winston from 'winston';
import 'winston-daily-rotate-file';



const errorFilter = winston.format((info) => info.level === 'error' ? info : false);
const debugFilter = winston.format((info) => info.level === 'debug' ? info : false);
const infoFilter = winston.format((info) => info.level === 'info' ? info : false);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'DD-MMM-YYYY hh:mm:ss A' }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
      }),
    ),
  }),
  new winston.transports.DailyRotateFile({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'DD-MMM-YYYY hh:mm:ss A' }),
      winston.format.prettyPrint(),
      errorFilter(),
    ),
    filename: 'logs/%DATE%-error.log',
    maxSize: '20M',
    maxFiles: '30D',
    level: 'error',
  }),
  new winston.transports.DailyRotateFile({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'DD-MMM-YYYY hh:mm:ss A' }),
      winston.format.prettyPrint(),
      debugFilter(),
    ),
    filename: 'logs/%DATE%-debug.log',
    maxSize: '20M',
    maxFiles: '30D',
    level: 'debug',
  }),
  new winston.transports.DailyRotateFile({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'DD-MMM-YYYY hh:mm:ss A' }),
      winston.format.prettyPrint(),
      infoFilter(),
    ),
    filename: 'logs/%DATE%-info.log',
    maxSize: '20M',
    maxFiles: '30D',
    level: 'info',
  }),
];

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      transports: transports,
    }),
  ],
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class LoggingModule { }
