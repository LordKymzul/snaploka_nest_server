import { ApiProperty } from "@nestjs/swagger";
import {
    IsString,
    IsNotEmpty,
    IsEmail,
    IsObject,
    IsOptional,
    IsBoolean
} from "class-validator";

export class CreateLoginAttemptDto {
    @ApiProperty({
        description: 'The email attempted to login',
        required: true,
        example: 'user@example.com',
    })
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email_attempted: string;

    @ApiProperty({
        description: 'The IP address of the login attempt',
        example: '127.0.0.1',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    ip_address: string;

    @ApiProperty({
        description: 'The user agent of the login attempt',
        example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        required: false,
    })
    @IsString()
    @IsOptional()
    user_agent?: string;

    @ApiProperty({
        description: 'Whether the login attempt was successful',
        example: true,
        required: true,
    })
    @IsBoolean()
    @IsNotEmpty()
    is_success: boolean;

    @ApiProperty({
        description: 'The reason for login failure',
        example: 'INVALID_PASSWORD',
        required: false,
    })
    @IsString()
    @IsOptional()
    failure_reason?: string;

    @ApiProperty({
        description: 'The user GUID (if user exists)',
        required: false,
    })
    @IsString()
    @IsOptional()
    user_id?: string;

    @ApiProperty({
        description: 'Additional metadata for the login attempt',
        example: {
            city: 'New York',
            country: 'United States',
        },
        required: false,
    })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;
}
