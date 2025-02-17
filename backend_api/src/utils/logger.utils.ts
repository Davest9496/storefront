export class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  public info(message: string, ...args: string[]): void {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log(`[${this.getTimestamp()}] INFO: ${message}`, ...args);
    }
  }

  public error(message: string, ...args: string[]): void {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.error(`[${this.getTimestamp()}] ERROR: ${message}`, ...args);
    }
  }
}
