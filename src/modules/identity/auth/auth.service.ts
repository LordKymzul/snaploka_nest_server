import { BadRequestException, Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

import { AUTH_PROVIDER, EVENT_NAMES, TOKEN_TYPE, USER_ROLE } from 'src/core/util/constant';
import { Config } from 'src/core/util/config';
import { AppLoggerService } from 'src/core/logging/app-logger/app-logger.service';

import { ClientInfo } from 'src/core/util/helper';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BackendToken } from './entities/backend-token';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginEvent } from './event/login-event';
import { DbappService } from 'src/core/database/dbapp/dbapp.service';
import { AdminSignUpDto } from './dto/admin-sign-up.dto';

//change to 10 seconds for testing
// const EXPIRE_TIME = 10 * 1000;

const EXPIRE_TIME = 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {



    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly logger: AppLoggerService,
        private readonly dbappService: DbappService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly config: Config,
    ) { }



    async signUpAdmin(adminSignUpDto: AdminSignUpDto) {

        const env = process.env.NODE_ENV;
        if (env !== 'dev') {
            throw new BadRequestException('Admin sign up is only available in development environment');
        }

        const userData = {
            ...adminSignUpDto,
            name: adminSignUpDto.name || adminSignUpDto.email.split('@')[0],
            auth_provider: AUTH_PROVIDER.CUSTOM,
            role: USER_ROLE.ADMIN,
        };

        console.log('userData', userData);

        const user = await this.userService.create(userData);

        const roles = Array.isArray(user.roles)
            ? user.roles.map((r: any) => r.name ?? r.role?.name).filter(Boolean)
            : [];

        const auth_providers = Array.isArray(user.auth_providers)
            ? user.auth_providers.map((ap: any) => ap.name ?? ap.auth_provider?.name).filter(Boolean)
            : [];


        const payload = {
            email: user.email,
            id: user.id,
            sub: {
                name: user.name,
                roles: roles,
                auth_providers: auth_providers,
            },
        };
        const tokens = await this.generateTokens(payload);

        await this.dbappService.user.update({
            where: { email: user.email },
            data: {
                last_signed_at: new Date(),
            },
        });

        const backendToken: BackendToken = {
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            expires_in: tokens.expiresIn,
        };
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: roles,
                auth_providers: auth_providers,
            },
            backendToken
        }

    }


    async signUp(signUpDto: SignUpDto) {
        const userData = {
            ...signUpDto,
            role: USER_ROLE.USER,
            name: signUpDto.name || signUpDto.email.split('@')[0],
        };

        const user = await this.userService.create(userData);

        const roles = Array.isArray(user.roles)
            ? user.roles.map((r: any) => r.name ?? r.role?.name).filter(Boolean)
            : [];

        const auth_providers = Array.isArray(user.auth_providers)
            ? user.auth_providers.map((ap: any) => ap.name ?? ap.auth_provider?.name).filter(Boolean)
            : [];


        const payload = {
            email: user.email,
            id: user.id,
            sub: {
                name: user.name,
                roles: roles,
                auth_providers: auth_providers,
            },
        };
        const tokens = await this.generateTokens(payload);

        await this.dbappService.user.update({
            where: { email: user.email },
            data: {
                last_signed_at: new Date(),
            },
        });

        const backendToken: BackendToken = {
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            expires_in: tokens.expiresIn,
        };
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: roles,
                auth_providers: auth_providers,
            },
            backendToken
        }
    }

    async signIn(signInDto: SignInDto, clientInfo: ClientInfo) {
        this.logger.info(`Signing in user ${signInDto.email}`, undefined, AuthService.name);
        try {

            await this.checkBruteForceLockout(signInDto.email, clientInfo.ipAddress);

            const user = await this.validateUser(signInDto);

            const roles = Array.isArray(user.roles)
                ? user.roles.map((r: any) => r.role?.name)
                : [];
            const auth_providers = Array.isArray(user.auth_providers)
                ? user.auth_providers.map((ap: any) => ap.auth_provider?.name)
                : [];

            const payload = {
                email: user.email,
                id: user.guid,
                sub: {
                    name: user.name,
                    roles: roles,
                    auth_providers: auth_providers,
                },
            };
            const tokens = await this.generateTokens(payload);

            this.eventEmitter.emit(
                EVENT_NAMES.LOGIN,
                new LoginEvent(
                    signInDto,
                    clientInfo.ipAddress,
                    true,
                    user.guid,
                    clientInfo.userAgent,
                    undefined
                ),
            );

            const { ...userData } = user;

            const backendToken: BackendToken = {
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
                expires_in: tokens.expiresIn,
            };
            return {
                user: {
                    id: userData.guid,
                    email: userData.email,
                    name: userData.name,
                    student: userData.student ?? null,
                    instructor: userData.instructor ?? null,
                    created_at: userData.created_at,
                    updated_at: userData.updated_at,
                    roles: roles,
                    auth_providers: auth_providers,
                },
                backendToken
            };
        } catch (error) {
            this.logger.error(`Error signing in user ${signInDto.email}`, error,);
            this.eventEmitter.emit(
                EVENT_NAMES.LOGIN,
                new LoginEvent(
                    signInDto,
                    clientInfo.ipAddress,
                    false,
                    null,
                    clientInfo.userAgent,
                    error.message ?? 'Invalid credentials'
                ),
            );
            throw error;
        }
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const { email } = forgotPasswordDto;
        const user = await this.dbappService.user.findUnique({
            where: {
                email: email,
            },
            select: {
                id: true,
                email: true,
                auth_providers: {
                    select: {
                        auth_provider: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (!user.auth_providers.some(ap => ap.auth_provider.name === AUTH_PROVIDER.CUSTOM)) {
            throw new BadRequestException("You are not authorized to reset your password, please use the password reset link sent to your email");
        }

        const generatedToken = await this.generateResetPasswordToken(user.id);

        if (!generatedToken) {
            throw new BadRequestException("Failed to generate reset password token");
        }

        //TODO: Send email with token
        // await this.emailService.sendEmail({
        //     to: user.email,
        //     subject: "Reset Your Password",
        //     text: "Reset Your Password",
        //     token: token.token
        // });
        this.logger.info(`Verification token: ${generatedToken.token} for user ${user.email}`);

        return {
            expires_at: generatedToken.expires_at,
            token: generatedToken.token
        };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const { token, password } = resetPasswordDto;
        if (!token || !password) {
            throw new BadRequestException('Token and password are required');
        }


        const findToken = await this.validateResetPasswordToken(token);
        if (!findToken || !findToken.user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const user = await this.dbappService.user.findUnique({
            where: { id: findToken.user.id },
            select: { id: true, password: true }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (!user.password) {
            throw new BadRequestException('User has no password');
        }

        const isPasswordSame = await bcrypt.compare(password, user.password);
        if (isPasswordSame) {
            throw new BadRequestException("New password cannot be the same as the old password");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        if (!hashedPassword) {
            throw new BadRequestException('Failed to hash password');
        }

        return this.dbappService.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });
            await tx.token.delete({
                where: { id: findToken.id }
            });
            return { email: findToken.user.email };
        });
    }

    async refreshToken(user: any) {

        this.logger.info(`Refreshing token for user ${user.id}`);

        const findUser = await this.dbappService.user.findUnique({
            where: { guid: user.id },
            select: {
                id: true,
                email: true,
                guid: true,
                name: true,
                created_at: true,
                updated_at: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                auth_providers: {
                    select: {
                        auth_provider: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!findUser) {
            throw new UnauthorizedException('User not found');
        }


        const payload = {
            email: findUser.email,
            id: findUser.guid,
            sub: {
                name: findUser.name,
                roles: Array.isArray(findUser.roles)
                    ? findUser.roles.map((r: any) => r.role?.name)
                    : [],
                auth_providers: Array.isArray(findUser.auth_providers)
                    ? findUser.auth_providers.map((ap: any) => ap.auth_provider?.name)
                    : [],
            },
        };
        const tokens = await this.generateTokens(payload);


        const backendToken: BackendToken = {
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            expires_in: tokens.expiresIn,
        };
        return {
            user: {
                id: findUser.guid,
                email: findUser.email,
                name: findUser.name,
                created_at: findUser.created_at,
                updated_at: findUser.updated_at,
                roles: findUser.roles,
                auth_providers: findUser.auth_providers,
            }
            ,
            backendToken
        };
    }


    private async validateUser(signInDto: SignInDto) {
        const query = `
            SELECT 
                u.id, 
                u.guid as guid, 
                u.email,
                u.created_at, 
                u.updated_at,
                u.password,
                u.name,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'name', r.name
                        )
                    ) FILTER (WHERE r.id IS NOT NULL), '[]'
                ) as roles,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'auth_provider_id', uap.auth_provider_id,
                            'auth_provider_name', ap.name
                        )
                    ) FILTER (WHERE uap.auth_provider_id IS NOT NULL), '[]'
                ) as auth_providers
            FROM users u
            LEFT JOIN user_roles ur ON ur.user_id = u.id
            LEFT JOIN roles r ON r.id = ur.role_id
            LEFT JOIN user_auth_providers uap ON uap.user_id = u.id
            LEFT JOIN auth_providers ap ON ap.id = uap.auth_provider_id
            WHERE u.email = $1
            GROUP BY u.id
            LIMIT 1
        `;
        const rawResult = await this.dbappService.$queryRawUnsafe(query, signInDto.email);

        if (!rawResult || !(rawResult as any).length) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const user = rawResult[0];

        let roles = [];
        let auth_providers = [];
        try {
            if (typeof user.roles === "string") {
                roles = JSON.parse(user.roles);
            } else if (Array.isArray(user.roles)) {
                roles = user.roles;
            }
            if (typeof user.auth_providers === "string") {
                auth_providers = JSON.parse(user.auth_providers);
            } else if (Array.isArray(user.auth_providers)) {
                auth_providers = user.auth_providers;
            }
        } catch (e) { }

        user.roles = (roles || []).map((r: any) => ({ role: { name: r.name } }));
        user.auth_providers = (auth_providers || [])
            .filter((ap: any) => ap.auth_provider_id !== null && ap.auth_provider_name !== null)
            .map((ap: any) => ({
                auth_provider_id: ap.auth_provider_id,
                auth_provider: { name: ap.auth_provider_name }
            }));

        if (
            !user.auth_providers.some(
                (up) => up.auth_provider.name === signInDto.auth_provider
            )
        ) {
            throw new UnauthorizedException(
                'Invalid credentials, you are not authorized to sign in with this provider'
            );
        }

        if (signInDto.auth_provider === AUTH_PROVIDER.CUSTOM) {
            if (!signInDto.password) {
                throw new BadRequestException('Password is required');
            }
            const isPasswordValid = await bcrypt.compare(
                signInDto.password,
                user.password
            );
            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials');
            }
        }
        const { password, ...userData } = user;
        return userData
    }

    private async validateResetPasswordToken(token: string) {
        const findToken = await this.dbappService.token.findFirst({
            where: {
                token: token,
                type: TOKEN_TYPE.RESET_PASSWORD
            },
            include: {
                user: true
            }
        });

        if (!findToken) {
            throw new NotFoundException("Invalid or expired token");
        }

        if (new Date() > findToken.expires_at) {
            throw new BadRequestException("Token is expired, Please request another token")
        }

        return findToken;
    }

    private async generateResetPasswordToken(user_id: number) {

        await this.dbappService.token.deleteMany({
            where: {
                user_id: user_id,
                type: TOKEN_TYPE.RESET_PASSWORD
            }
        });

        const resetPasswordToken = (Math.floor(10000 + Math.random() * 90000)).toString();
        const expireTime = new Date().getTime() + 15 * 60 * 1000;
        const expirationDate = new Date(expireTime);

        return this.dbappService.token.create({
            data: {
                token: resetPasswordToken,
                expires_at: expirationDate,
                user_id: user_id,
                type: TOKEN_TYPE.RESET_PASSWORD
            }
        });
    }

    private async generateTokens(payload: any) {

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: '1d',
                secret: this.config.getJwtConfig().secret,
            }),
            this.jwtService.signAsync(payload, {
                expiresIn: '7d',
                secret: this.config.getJwtConfig().refreshSecret,
            }),
        ]);
        return {
            accessToken,
            refreshToken,
            expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
        };
    }

    async checkBruteForceLockout(email: string, ipAddress: string): Promise<void> {
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const normalizedEmail = email.toLowerCase();

        // Check number of failed attempts from this IP in the last 15 minutes
        const failedIpAttemptResult = await this.dbappService.$queryRawUnsafe<{ count: number }[]>(
            `
            SELECT COUNT(*)::int as count
            FROM login_attempts
            WHERE ip_address = $1
              AND is_success = false
              AND created_at >= $2
              AND email_attempted = $3
            `,
            ipAddress,
            fifteenMinutesAgo,
            normalizedEmail,
        );

        const failedIpAttempts = Number(failedIpAttemptResult[0]?.count ?? 0);

        if (failedIpAttempts >= 10) {
            throw new BadRequestException('IP address temporarily blocked due to excessive failed attempts');
        }

        // Check number of failed attempts for this email in the last 15 minutes
        const failedEmailAttemptResult = await this.dbappService.$queryRawUnsafe<{ count: number }[]>(
            `
            SELECT COUNT(*)::int as count
            FROM login_attempts
            WHERE email_attempted = $1
              AND is_success = false
              AND created_at >= $2
            `,
            normalizedEmail,
            fifteenMinutesAgo,
        );

        const failedEmailAttempts = Number(failedEmailAttemptResult[0]?.count ?? 0);

        if (failedEmailAttempts >= 5) {
            throw new UnauthorizedException('Account temporarily locked. Please try again in 15 minutes or reset your password.');
        }
    }
}
