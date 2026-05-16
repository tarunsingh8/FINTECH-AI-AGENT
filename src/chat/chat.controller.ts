import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ChatService } from "./chat.service.js";
import { ChatDto, ClearDto } from "./chat.dto.js";

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // POST /chat
  @Post("chat")
  @HttpCode(HttpStatus.OK)
  async chat(@Body() body: ChatDto) {
    return this.chatService.chat(body.sessionId, body.message);
  }

  // DELETE /chat/:sessionId
  @Delete("chat/:sessionId")
  async clearSession(@Param("sessionId") sessionId: string) {
    return this.chatService.clearSession(sessionId);
  }

  // GET /health
  @Get("health")
  health() {
    return this.chatService.getHealth();
  }
}