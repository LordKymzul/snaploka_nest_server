import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { AUTH_PROVIDER } from 'src/core/util/constant';

export class SignInDto {

    @ApiProperty({
        description: 'The email of the user',
        example: 'dev@snaploka.com',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    email: string;


    @ApiProperty({
        description: 'The password of the user',
        example: 'password',
        required: false,
    })
    @IsString()
    @IsOptional()
    password?: string;


    @ApiProperty({
        description: `The auth provider of the user contain ${Object.values(AUTH_PROVIDER).join(', ')}`,
        example: AUTH_PROVIDER.CUSTOM,
        required: true,
        enum: AUTH_PROVIDER,

    })
    @IsEnum(AUTH_PROVIDER)
    @IsNotEmpty()
    auth_provider: AUTH_PROVIDER;
}

