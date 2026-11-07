import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { USER_ROLE } from "src/core/util/constant";

export class SignInGoogleDto {

    @ApiProperty({
        description: 'The ID token from Google',
        example: '1234567890',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    id_token: string;

    @ApiProperty({
        description: `The role of the user contain ${Object.values(USER_ROLE).join(', ')}`,
        example: USER_ROLE.USER,
        required: true,
        enum: USER_ROLE,
    })
    @IsEnum(USER_ROLE)
    @IsNotEmpty()
    role: USER_ROLE;
}