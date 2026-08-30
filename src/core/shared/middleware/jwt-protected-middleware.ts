import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import * as jwt from 'jsonwebtoken';
import { DbappService } from "src/core/database/dbapp/dbapp.service";
import { Config } from "src/core/util/config";

@Injectable()
export class JwtProtectedMiddleware implements NestMiddleware {

    constructor(
        private readonly config: Config,
        private readonly databaseService: DbappService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            if (this.isPublicEndpoint(req)) {
                return next();
            }
            const authorization = req.header('Authorization');
            if (authorization && authorization.startsWith('Bearer ')) {
                const token = authorization.substring(7);
                const devApiKey = this.config.getSnaplokaApiKey();
                if (token === devApiKey) {
                    return this.getDevUser(req, next);
                }

                return this.getUser(token, req, next);
            }

            throw new UnauthorizedException('Unauthorized: Missing API key or Bearer token');
        } catch (error) {
            throw new UnauthorizedException(
                error?.message || 'Invalid access token, You are not authorized to access this resource'
            );
        }
    }

    // Placeholder for public endpoint logic, adjust as needed
    private isPublicEndpoint(req: Request): boolean {
        const path = req.path;
        const method = req.method;
        return path.startsWith('/auth/')
            || path.startsWith('/news-stories')
            || path.startsWith('/server-health')
            || path === '/payment/webhook'
            || (method === 'GET' && path === '/library/documents/trimmed')
            || (method === 'POST' && path === '/profile/contributors');
    }

    async verifyAccessToken(accessToken: string): Promise<any> {
        return jwt.verify(accessToken, this.config.getJwtConfig().secret || '');
    }

    private async getDevUser(req: Request, next: NextFunction) {
        const user = await this.fetchAuthUserByEmail('dev@snaploka.com');
        req['user'] = user;
        return next();
    }

    private async getUser(token: string, req: Request, next: NextFunction) {
        let decoded: any;
        try {
            decoded = await this.verifyAccessToken(token);
        } catch {
            throw new UnauthorizedException('Invalid access token, You are not authorized to access this resource');
        }

        const user = await this.fetchAuthUserByGuid(String(decoded.id));
        req['user'] = user;
        return next();
    }

    private async fetchAuthUserByEmail(email: string) {
        return this.fetchAuthUser(`u.email::text = $1::text`, email);
    }

    private async fetchAuthUserByGuid(guid: string) {
        return this.fetchAuthUser(`u.guid::text = $1::text`, guid);
    }

    private async fetchAuthUser(whereClause: string, param: string) {
        const userQuery = `
            WITH base_user AS (
                SELECT
                    u.id,
                    u.guid,
                    u.email,
                    u.created_at,
                    u.updated_at
                FROM users u
                WHERE ${whereClause}
                LIMIT 1
            ),
            user_roles AS (
                SELECT
                    COALESCE(
                        json_agg(
                            DISTINCT jsonb_build_object(
                                'id', r.guid,
                                'name', r.name
                            )
                        ) FILTER (WHERE r.id IS NOT NULL),
                        '[]'::json
                    ) AS roles
                FROM base_user bu
                LEFT JOIN user_roles ur ON ur.user_id = bu.id
                LEFT JOIN roles r ON r.id = ur.role_id
            ),
            user_auth_providers AS (
                SELECT
                    COALESCE(
                        json_agg(
                            DISTINCT jsonb_build_object(
                                'id', ap.guid,
                                'name', ap.name
                            )
                        ) FILTER (WHERE ap.id IS NOT NULL),
                        '[]'::json
                    ) AS auth_providers
                FROM base_user bu
                LEFT JOIN user_auth_providers uap ON uap.user_id = bu.id
                LEFT JOIN auth_providers ap ON ap.id = uap.auth_provider_id
            )
            SELECT
                bu.guid AS id,
                bu.email,
                bu.created_at,
                bu.updated_at,
                ur.roles,
                uap.auth_providers
            FROM base_user bu
            CROSS JOIN user_roles ur
            CROSS JOIN user_auth_providers uap
            LIMIT 1
        `;

        const user = await this.databaseService.$queryRawUnsafe(userQuery, param);

        if (!user || !Array.isArray(user) || user.length === 0) {
            throw new UnauthorizedException('Invalid access token, You are not authorized to access this resource');
        }

        const resultUser = user[0];
        resultUser.roles = typeof resultUser.roles === 'string'
            ? JSON.parse(resultUser.roles)
            : resultUser.roles || [];
        resultUser.auth_providers = typeof resultUser.auth_providers === 'string'
            ? JSON.parse(resultUser.auth_providers)
            : resultUser.auth_providers || [];

        return resultUser;
    }
}
