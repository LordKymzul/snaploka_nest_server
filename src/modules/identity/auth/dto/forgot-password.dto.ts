import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
export class ForgotPasswordDto {

    @ApiProperty({
        description: 'The email of the user',
        example: 'john.doe@example.com',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    email: string;
}