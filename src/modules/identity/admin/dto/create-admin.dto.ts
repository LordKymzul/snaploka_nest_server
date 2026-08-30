import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class CreateAdminDto {

    @ApiProperty({
        description: 'The user ID',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    user_id: string;

    @ApiProperty({
        description: 'The is_active',
        required: false,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @ApiProperty({
        description: 'The metadata',
        required: false,
    })
    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}
