import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString
} from 'class-validator';
import { AUTH_PROVIDER, USER_ROLE } from 'src/core/util/constant';




export class CreateUserDto {

    @ApiProperty({
        description: 'The name of the user',
        example: 'John Doe',
        required: false,
    })
    @IsString()
    @IsOptional()
    name?: string;


    @ApiProperty({
        description: 'The email of the user',
        example: 'john.doe@example.com',
        required: true,
    })
    @IsEmail()
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
        description: 'The active status of the user',
        example: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean = true;


    @ApiProperty({
        description: 'The metadata of the user',
        example: { key: 'value' },
        required: false,
    })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any> = {};


    @ApiProperty({
        description: 'The auth provider of the user',
        example: AUTH_PROVIDER.CUSTOM,
        required: true,
        enum: AUTH_PROVIDER,
    })
    @IsEnum(AUTH_PROVIDER)
    @IsNotEmpty()
    auth_provider: AUTH_PROVIDER;


    @ApiProperty({
        description: 'The role of the user',
        example: USER_ROLE.USER,
        required: false,
        enum: USER_ROLE,
    })
    @IsEnum(USER_ROLE)
    @IsOptional()
    role: USER_ROLE;
}


