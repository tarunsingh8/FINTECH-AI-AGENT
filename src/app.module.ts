import { Module } from "@nestjs/common";
import { ChatController } from "./chat/chat.controller.js";
import { ChatService } from "./chat/chat.service.js";

@Module({
  controllers: [ChatController],
  providers: [ChatService],
})
export class AppModule {}