import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { USER_ROLE } from 'src/core/util/constant';

export class CreateRoleDto {

    @ApiProperty({
        description: 'The name of the role',
        required: true,
        example: USER_ROLE.ADMIN,
        enum: Object.values(USER_ROLE),
    })
    @IsString()
    @IsNotEmpty()
    name: string;


    @ApiProperty({
        description: 'The description of the role',
        required: false,
        example: 'Administrator with full system access',
    })
    @IsString()
    @IsOptional()
    description?: string;


    @ApiProperty({
        description: 'The active status of the role',
        required: false,
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean = true;


    @ApiProperty({
        description: 'The metadata of the role',
        example: { key: 'value' },
        required: false,
    })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any> = {};
}
