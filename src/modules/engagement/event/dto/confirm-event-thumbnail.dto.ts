import { ApiProperty } from "@nestjs/swagger";
import {
    IsString,
    IsNotEmpty
} from "class-validator";
export class ConfirmEventThumbnailDto {
    @ApiProperty({
        description: 'The id of the event',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    previous_storage_key: string;
}