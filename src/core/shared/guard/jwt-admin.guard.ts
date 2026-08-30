import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isAdmin } from 'src/core/util/helper';

@Injectable()
export class JwtAdminGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;


        if (!user) {
            throw new UnauthorizedException('Authentication required');
        }


        if (!isAdmin(user)) {
            throw new ForbiddenException('User is not authorized to access this resource');
        }

        return true;
    }
}