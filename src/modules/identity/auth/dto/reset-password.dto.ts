import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";



export class ResetPasswordDto {

    @ApiProperty({
        description: 'The token of the user',
        example: '1234567890',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    token: string;


    @ApiProperty({
        description: 'The password of the user',
        example: 'password',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}