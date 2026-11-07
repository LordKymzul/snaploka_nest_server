import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsArray,
    ValidateNested
} from "class-validator";

import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";


export class CreateEventPostAttachmentDto {
    @ApiProperty({
        description: 'The mime type of the media',
        example: 'image/jpeg',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    mime_type: string;


    @ApiProperty({
        description: 'The file size of the media',
        example: 1000,
        required: true,
    })
    @IsNumber()
    @IsNotEmpty()
    file_size_bytes: number;



    @IsString()
    @IsOptional()
    storage_key?: string;

    
    @IsString()
    @IsOptional()
    upload_url?: string;
}

export class CreateEventPostDto {

    @ApiProperty({
        description: 'The guest name of the post',
        example: 'John Doe',
        required: false,
    })
    @IsString()
    @IsOptional()
    guest_name?: string;

    @ApiProperty({
        description: 'The content of the post',
        example: 'This is a test post',
        required: false,
    })
    @IsString()
    @IsOptional()
    content?: string;

    @ApiProperty({
        description: 'The event id of the post',
        example: '1234567890',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    event_id: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateEventPostAttachmentDto)
    attachments?: CreateEventPostAttachmentDto[];

}


