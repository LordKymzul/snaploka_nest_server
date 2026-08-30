import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";


@Injectable()
export class RefreshJwtGuard implements CanActivate {

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException("Token is undefined");
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_REFRESH_SECRET_KEY')
            });
            request['user'] = payload;
            return true;
        } catch (e) {
            throw new UnauthorizedException();
        }
    }


    private extractTokenFromHeader(request: Request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === "Refresh" ? token : undefined;
    }
}