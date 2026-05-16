import { IsString, IsNotEmpty, MinLength } from "class-validator";

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  message: string;
}

export class ClearDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;
}