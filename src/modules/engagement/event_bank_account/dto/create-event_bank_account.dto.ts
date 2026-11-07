import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsDate,
    IsOptional,
    IsEnum,
    IsObject,
    MaxLength,
    IsNumber,
} from 'class-validator';
import { EVENT_BANK_ACCOUNT_TYPE } from 'src/core/util/constant';

export class CreateEventBankAccountDto {

    @ApiProperty({
        description: 'The event id',
        example: '1234567890',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    event_id: string;

    @ApiProperty({
        description: 'The name of the bank',
        example: 'Maybank',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    bank_name: string;

    @ApiProperty({
        description: 'The account number',
        example: '1234567890',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    account_number: string;

    @ApiProperty({
        description: 'The account holder name',
        example: 'John Doe',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    account_holder_name: string;


    @ApiProperty({
        description: 'The metadata',
        example: {
            key: 'value',
        },
        required: false,
    })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;

    @ApiProperty({
        description: 'The mime type of the media',
        example: 'image/jpeg',
        required: true,
    })
    @IsString()
    @IsOptional()
    qr_image_mime_type?: string;

    @ApiProperty({
        description: 'The file size of the media',
        example: 1000,
        required: true,
    })
    @IsNumber()
    @IsOptional()
    qr_image_file_size?: number;

    @ApiProperty({
        description: 'The type of the bank account',
        example: EVENT_BANK_ACCOUNT_TYPE.BRIDE,
        required: true,
        enum: EVENT_BANK_ACCOUNT_TYPE,
    })
    @IsEnum(EVENT_BANK_ACCOUNT_TYPE)
    @IsNotEmpty()
    type: EVENT_BANK_ACCOUNT_TYPE;
}

