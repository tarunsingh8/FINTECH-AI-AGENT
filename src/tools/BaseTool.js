export class BaseTool {
  name() {
    throw new Error(`${this.constructor.name} must implement name()`);
  }

  description() {
    throw new Error(`${this.constructor.description} must implement description()`);
  }

  parameters() {
    throw new Error(`${this.constructor.parameters} must implement parameters()`);
  }

  async use(args) {
    throw new Error(`${this.constructor.use} must implement use()`);
  }

  toFunctionDeclaration() {
    return {
      name: this.name(),
      description: this.description(),
      parameters: this.parameters(),
    };
  }
}