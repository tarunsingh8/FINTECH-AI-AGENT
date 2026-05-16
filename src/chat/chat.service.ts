import { Injectable } from "@nestjs/common";
import { Orchestrator } from "../agents/Orchestrator.js";

@Injectable()
export class ChatService {
  private sessions: Map<string, Orchestrator> = new Map();

  private getOrchestrator(sessionId: string): Orchestrator {
    if (!this.sessions.has(sessionId)) {
      console.log(`\n🆕 New session created: ${sessionId}`);
      this.sessions.set(sessionId, new Orchestrator(sessionId));
    }
    return this.sessions.get(sessionId)!;
  }

  async chat(sessionId: string, message: string) {
    const startTime = Date.now();
    const orchestrator = this.getOrchestrator(sessionId);

    const reply = await orchestrator.process(message);
    const duration = Date.now() - startTime;

    return {
      sessionId,
      message,
      reply,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    };
  }

  async clearSession(sessionId: string) {
    if (this.sessions.has(sessionId)) {
      // Clear Redis memory for all agents
      const orchestrator = this.getOrchestrator(sessionId);
      await orchestrator.memory.clear();

      // Remove from sessions map
      this.sessions.delete(sessionId);

      return {
        sessionId,
        cleared: true,
        message: "Session cleared successfully",
      };
    }

    return {
      sessionId,
      cleared: false,
      message: "Session not found",
    };
  }

  getHealth() {
    return {
      status: "ok",
      activeSessions: this.sessions.size,
      timestamp: new Date().toISOString(),
    };
  }
}