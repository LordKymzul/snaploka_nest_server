import { ApiProperty } from "@nestjs/swagger";
import {
    IsEnum,
    IsNumber,
    IsOptional,
    IsString
} from "class-validator";
import { Transform } from "class-transformer";
import {
    EVENT_BANK_ACCOUNT_TYPE,
    PAGINATION_LIMIT,
    PAGINATION_PAGE
} from "src/core/util/constant";

export class QueryEventBankAccountDto {
    @ApiProperty({
        description: 'The event id of the bank account',
        required: false,
    })
    @IsString()
    @IsOptional()
    event_id?: string;

    @ApiProperty({
        description: 'Filter by active status',
        required: false,
        enum: ['true', 'false'],
    })
    @IsString()
    @IsOptional()
    is_active?: 'true' | 'false';

    @ApiProperty({
        description: 'The limit of the bank accounts',
        required: false,
        example: PAGINATION_LIMIT,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    limit: number = PAGINATION_LIMIT;

    @ApiProperty({
        description: 'The page of the bank accounts',
        required: false,
        example: PAGINATION_PAGE,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    page: number = PAGINATION_PAGE;


    @ApiProperty({
        description: 'Whether to include the event in the response',
        required: false,
        enum: ['true', 'false'],
    })
    @IsString()
    @IsOptional()
    with_event?: 'true' | 'false';

    @ApiProperty({
        description: 'The type of the bank account',
        required: false,
        enum: EVENT_BANK_ACCOUNT_TYPE,
    })
    @IsEnum(EVENT_BANK_ACCOUNT_TYPE)
    @IsOptional()
    type?: EVENT_BANK_ACCOUNT_TYPE;
}
