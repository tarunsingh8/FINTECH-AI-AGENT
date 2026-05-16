import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Auto-validate all incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Enable CORS for frontend
  app.enableCors();

  const port = 3000;
  await app.listen(port);

  console.log(`
╔══════════════════════════════════════════════╗
║   🚀 Fintech AI Agent API is running!        ║
║                                              ║
║   POST   http://localhost:${port}/chat           ║
║   DELETE http://localhost:${port}/chat/:sessionId║
║   GET    http://localhost:${port}/health         ║
╚══════════════════════════════════════════════╝
  `);
}

bootstrap();