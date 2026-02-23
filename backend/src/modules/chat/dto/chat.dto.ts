import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
    @ApiPropertyOptional({ description: 'Session title', example: 'New Course Chat' })
    @IsString()
    @IsOptional()
    title?: string;
}

export class UpdateSessionDto {
    @ApiProperty({ description: 'New session title', example: 'React Course Design' })
    @IsString()
    @IsNotEmpty()
    title: string;
}

export class SaveMessageDto {
    @ApiProperty({ description: 'Message role', enum: ['user', 'ai'], example: 'user' })
    @IsEnum(['user', 'ai'])
    @IsNotEmpty()
    role: 'user' | 'ai';

    @ApiProperty({ description: 'Message content', example: 'Create a React course for beginners' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiPropertyOptional({ description: 'Additional metadata (course data, generation steps, etc)' })
    @IsOptional()
    metadata?: any;
}

export class SessionResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class MessageResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    sessionId: string;

    @ApiProperty({ enum: ['user', 'ai'] })
    role: string;

    @ApiProperty()
    content: string;

    @ApiProperty({ required: false })
    metadata?: any;

    @ApiProperty()
    createdAt: Date;
}

export class SessionWithMessagesDto extends SessionResponseDto {
    @ApiProperty({ type: [MessageResponseDto] })
    messages: MessageResponseDto[];
}
