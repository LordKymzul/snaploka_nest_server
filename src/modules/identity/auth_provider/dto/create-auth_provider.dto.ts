import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { AUTH_PROVIDER } from 'src/core/util/constant';

export class CreateAuthProviderDto {

    @ApiProperty({
        description: 'The name of the auth provider',
        required: true,
        example: AUTH_PROVIDER.EMAIL,
        enum: Object.values(AUTH_PROVIDER),
    })
    @IsString()
    @IsNotEmpty()
    name: string;


    @ApiProperty({
        description: 'The description of the auth provider',
        required: false,
        example: 'Email authentication provider',
    })
    @IsString()
    @IsOptional()
    description?: string;


    @ApiProperty({
        description: 'The active status of the auth provider',
        required: false,
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean = true;


    @ApiProperty({
        description: 'The metadata of the auth provider',
        required: false,
        example: { key: 'value' },
    })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any> = {};
}
