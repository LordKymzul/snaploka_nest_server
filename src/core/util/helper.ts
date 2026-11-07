
import {
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
    InternalServerErrorException,
    ConflictException,
} from '@nestjs/common';
import { Logger } from 'winston';
import { AppLoggerService } from '../logging/app-logger/app-logger.service';

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export function getPagination(page: number, limit: number, total: number) {
    return {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
        total_pages: Math.ceil(Number(total) / Number(limit)),
        current_page: Number(page),
        next_page: Number(page) + 1,
        previous_page: Number(page) - 1,
        has_next_page: Number(page) < Math.ceil(Number(total) / Number(limit)),
        has_previous_page: Number(page) > 1,
        is_first_page: Number(page) === 1,
        is_last_page: Number(page) === Math.ceil(Number(total) / Number(limit)),
    }
}

export function buildCacheKey(...parts: string[]): string {
    return parts.filter(Boolean).join(':');
}




export function transformGuidToId(obj: any) {
    if (Array.isArray(obj)) {
        return obj.map(item => transformGuidToId(item));
    } else if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        const hasGuid = Object.prototype.hasOwnProperty.call(obj, 'guid');
        Object.keys(obj).forEach(key => {
            if (key === 'id') {
                if (hasGuid) {
                    newObj['id'] = obj['guid'];
                } else {
                    newObj['id'] = obj['id'];
                }
                // do not skip if there's no guid!
            } else if (key === 'guid' && Object.prototype.hasOwnProperty.call(obj, 'id')) {
                // Don't add a separate guid field if we're supplying id = guid
            } else if (
                obj[key] instanceof Date
            ) {
                // explicitly convert Date objects to ISO string
                newObj[key] = obj[key].toISOString();
            } else if (Array.isArray(obj[key]) || (obj[key] && typeof obj[key] === 'object')) {
                newObj[key] = transformGuidToId(obj[key]);
            } else {
                newObj[key] = obj[key];
            }
        });
        return newObj;
    } else {
        return obj;
    }
}



export function isAdmin(user: any) {
    return user.roles.some(role => role.name === 'ADMIN');
}

export function isInstructor(user: any,) {
    return user.roles.some(role => role.name === 'INSTRUCTOR');
}


export function isUser(user: any, userId: string) {
    return user.id === userId;
}


export function authorizeStudentOrAdmin(req: any, studentId: string) {
    const authedUser = req?.user;
    const authedStudentId = authedUser?.['student']?.['id'] ?? null;
    if (!authedUser || !authedUser['id']) {
        return {
            is_authorized: false,
            message: 'User not found',
        }
            ;
    }
    if (isAdmin(authedUser)) {
        return {
            is_authorized: true,
            message: 'You are authorized to access this resource',
        };
    }
    if (authedStudentId && authedStudentId === studentId) {
        return {
            is_authorized: true,
            message: 'You are authorized to access this resource',
        };
    }
    return {
        is_authorized: false,
        message: 'You are not authorized to access this resource',
    };
}


export function authorizeInstructorOrAdmin(req: any, instructorId: string) {
    const authedUser = req?.user;
    const authedInstructorId = authedUser?.['instructor']?.['id'] ?? null;

    if (!authedUser || !authedUser['id']) {
        return {
            is_authorized: false,
            message: 'User not found',
        };
    }

    if (isAdmin(authedUser)) {
        return {
            is_authorized: true,
            message: 'You are authorized to access this resource',
        };
    }
    if (authedInstructorId && authedInstructorId === instructorId) {
        return {
            is_authorized: true,
            message: 'You are authorized to access this resource',
        };
    }

    return {
        is_authorized: false,
        message: 'You are not authorized to access this resource',
    };
}



export function authorizeUserOrAdmin(req: any, userId: string) {
    const authedUser = req?.user;
    if (!authedUser || !authedUser['id']) {
        console.log('authedUser', authedUser);
        return {
            is_authorized: false,
            message: 'User not found or unauthorized',
        };
    }

    if (!isAdmin(authedUser) && authedUser['id'] !== userId) {
        return {
            is_authorized: false,
            message: 'You are not authorized to access this resource',
        };
    }
    return {
        is_authorized: true,
        message: 'You are authorized to access this resource',
    };
}

export function handleError(error: any, logger?: AppLoggerService, context?: string) {
    if (logger) {
        logger.error(error, context);
    }
    if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
    } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
    } else if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
    } else if (error instanceof ForbiddenException) {
        throw new ForbiddenException(error.message);
    } else if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
    } else {
        throw new InternalServerErrorException(error.message);
    }
}

export function validateDate(date: string) {
    if (new Date(date) < new Date()) {
        throw new BadRequestException('Date cannot be in the past');
    }
}



export function getBase64FileSize(base64String: string) {
    const cleanString = base64String.split(',')[1] || base64String;

    const stringLength = cleanString.length;

    let padding = 0;
    if (cleanString.endsWith('==')) padding = 2;
    else if (cleanString.endsWith('=')) padding = 1;

    return (stringLength * 3 / 4) - padding;;
}

//convert uint8array to base64
export function convertUint8ArrayToBase64(uint8Array: Uint8Array) {
    const buffer = Buffer.from(uint8Array);
    return buffer.toString("base64");
}

export function extractTemplateVariables(html: string): string[] {
    const pattern: RegExp = /\{\{(.*?)\}\}/g;
    const matches = html.matchAll(pattern);
    const variables = Array.from(matches, (match) => match[1].trim());
    return variables;
}



export interface ClientInfo {
    ipAddress: string;
    userAgent: string;
}

export const GetClientInfo = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): ClientInfo => {
        const request = ctx.switchToHttp().getRequest<Request>();

        const ipAddress =
            (request.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
            request.socket.remoteAddress ||
            '';


        const userAgent = request.headers['user-agent'] || '';

        return { ipAddress, userAgent };
    },
);


export const toNumberIfBigInt = (value: any) => typeof value === 'bigint' ? Number(value) : value;
