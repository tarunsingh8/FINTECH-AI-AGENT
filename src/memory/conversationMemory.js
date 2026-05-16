import Redis from "ioredis";

const redis = new Redis(); // connects to localhost:6379 by default

export class ConversationMemory {
  constructor(sessionId) {
    // Each user/session gets their own memory slot in Redis
    // Key looks like: "conversation:user_123"
    this.key = `conversation:${sessionId}`;
    this.maxMessages = 20; // keep last 20 messages only
  }

  // Add a new message to history
  async addMessage(role, content) {
    const message = JSON.stringify({ role, content });

    // RPUSH = add to end of list in Redis
    await redis.rpush(this.key, message);

    // Keep only last 20 messages (trim the list)
    await redis.ltrim(this.key, -this.maxMessages, -1);

    // Expire after 1 hour of inactivity
    await redis.expire(this.key, 3600);
  }

  // Get full conversation history
  async getHistory() {
    // LRANGE = get all items from Redis list
    const messages = await redis.lrange(this.key, 0, -1);

    // Parse each message from JSON string back to object
    return messages.map((msg) => JSON.parse(msg));
  }

  // Clear memory (new conversation)
  async clear() {
    await redis.del(this.key);
    console.log("🗑️  Memory cleared");
  }

  // See what's in memory right now
  async debug() {
    const history = await this.getHistory();
    console.log("\n📝 Current Memory:");
    history.forEach((msg, i) => {
      console.log(`   ${i + 1}. ${msg.role}: ${msg.content.slice(0, 60)}...`);
    });
  }
}