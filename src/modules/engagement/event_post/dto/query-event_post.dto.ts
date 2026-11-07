import { ApiProperty } from "@nestjs/swagger";
import {
    IsNumber,
    IsOptional,
    IsString
} from "class-validator";
import { Transform } from "class-transformer";
import {
    PAGINATION_LIMIT,
    PAGINATION_PAGE
} from "src/core/util/constant";

export class QueryEventPostDto {
    @ApiProperty({
        description: 'The event id of the post',
        required: false,
    })
    @IsString()
    @IsOptional()
    event_id?: string;

    @ApiProperty({
        description: 'The limit of the posts',
        required: false,
        example: PAGINATION_LIMIT,
    })
    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    limit: number = PAGINATION_LIMIT;

    @ApiProperty({
        description: 'The page of the posts',
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
}
