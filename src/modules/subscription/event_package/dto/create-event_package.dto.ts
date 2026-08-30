import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateEventPackageDto {
    @ApiProperty({
        description: 'The name of the event package',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'The description of the event package',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'The price of the event package',
        required: true,
    })
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @ApiProperty({
        description: 'The currency of the event package',
        required: false,
    })
    @IsString()
    @IsOptional()
    currency?: string;

    @ApiProperty({
        description: 'The maximum number of media count of the event package',
        required: true,
    })
    @IsNumber()
    @IsNotEmpty()
    max_media_count: number;

    @ApiProperty({
        description: 'The maximum size of the media of the event package',
        required: true,
    })
    @IsNumber()
    @IsNotEmpty()
    max_media_size: number;

    @ApiProperty({
        description: 'The active status of the event package',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean = true;

    @ApiProperty({
        description: 'The metadata of the event package',
        required: false,
    })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any> = {};
}
