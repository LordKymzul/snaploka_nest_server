import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ConfirmUploadRequestDto {

    @ApiProperty({
        description: 'The id of the event media',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    event_media_id: string;
}