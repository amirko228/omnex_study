import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
    CreateSessionDto,
    UpdateSessionDto,
    SaveMessageDto,
    SessionResponseDto,
    MessageResponseDto,
    SessionWithMessagesDto,
} from './dto/chat.dto';

@ApiTags('Chat Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat/sessions')
export class ChatController {
    constructor(private chatService: ChatService) { }

    @Post()
    @ApiOperation({ summary: 'Create new chat session' })
    @ApiResponse({ status: 201, description: 'Session created', type: SessionResponseDto })
    async createSession(@Req() req: any, @Body() dto: CreateSessionDto) {
        return this.chatService.createSession(req.user.id, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all user chat sessions' })
    @ApiResponse({ status: 200, description: 'List of sessions', type: [SessionResponseDto] })
    async getUserSessions(@Req() req: any) {
        return this.chatService.getUserSessions(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get session with messages' })
    @ApiResponse({ status: 200, description: 'Session with messages', type: SessionWithMessagesDto })
    async getSession(@Req() req: any, @Param('id') sessionId: string) {
        return this.chatService.getSessionWithMessages(req.user.id, sessionId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update session title' })
    @ApiResponse({ status: 200, description: 'Session updated', type: SessionResponseDto })
    async updateSession(
        @Req() req: any,
        @Param('id') sessionId: string,
        @Body() dto: UpdateSessionDto,
    ) {
        return this.chatService.updateSession(req.user.id, sessionId, dto);
    }

    @Post(':id/messages')
    @ApiOperation({ summary: 'Save message to session' })
    @ApiResponse({ status: 201, description: 'Message saved', type: MessageResponseDto })
    async saveMessage(
        @Req() req: any,
        @Param('id') sessionId: string,
        @Body() dto: SaveMessageDto,
    ) {
        return this.chatService.saveMessage(req.user.id, sessionId, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete session (Clear Chat)' })
    @ApiResponse({ status: 200, description: 'Session deleted' })
    async deleteSession(@Req() req: any, @Param('id') sessionId: string) {
        return this.chatService.deleteSession(req.user.id, sessionId);
    }
}
