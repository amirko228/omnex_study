import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlogPostDto {
    @ApiProperty({ example: 'Getting Started with AI', description: 'Заголовок поста' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'A comprehensive guide to artificial intelligence', description: 'Краткое описание' })
    @IsString()
    @IsNotEmpty()
    excerpt: string;

    @ApiProperty({ example: '# Introduction\n\nThis is the content...', description: 'Содержимое (markdown)' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiPropertyOptional({ example: 'https://example.com/image.jpg', description: 'Обложка поста' })
    @IsString()
    @IsOptional()
    coverImage?: string;

    @ApiProperty({ example: 'AI', description: 'Категория' })
    @IsString()
    @IsNotEmpty()
    category: string;

    @ApiPropertyOptional({ example: ['machine-learning', 'tutorial'], description: 'Теги' })
    @IsArray()
    @IsOptional()
    tags?: string[];

    @ApiPropertyOptional({ example: 10, description: 'Время чтения в минутах' })
    @IsInt()
    @IsOptional()
    @Min(1)
    readTime?: number;

    @ApiPropertyOptional({ example: true, description: 'Опубликовать сразу' })
    @IsBoolean()
    @IsOptional()
    published?: boolean;
}

export class UpdateBlogPostDto {
    @ApiPropertyOptional({ example: 'Updated title' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({ example: 'Updated excerpt' })
    @IsString()
    @IsOptional()
    excerpt?: string;

    @ApiPropertyOptional({ example: 'Updated content' })
    @IsString()
    @IsOptional()
    content?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    coverImage?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    category?: string;

    @ApiPropertyOptional()
    @IsArray()
    @IsOptional()
    tags?: string[];

    @ApiPropertyOptional()
    @IsInt()
    @IsOptional()
    @Min(1)
    readTime?: number;

    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    published?: boolean;
}

export class CreateCommentDto {
    @ApiProperty({ example: 'Great article!', description: 'Текст комментария' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiPropertyOptional({ example: 'uuid', description: 'ID родительского комментария для ответа' })
    @IsString()
    @IsOptional()
    parentId?: string;
}
