import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Logger } from '../utils/logger.utils';

const logger = new Logger();

const envFile = process.env.ENV === 'production' ? '.env.production' : '.env';
const envPath = path.resolve(process.cwd(), envFile);

logger.info(`Current working directory: ${process.cwd()}`);
logger.info(`Loading environment from: ${envPath}`);

dotenv.config({ path: envPath });

logger.info(`
Environment Variables:
NODE_ENV: ${process.env.ENV ?? 'not set'}
ENV: ${process.env.ENV ?? 'not set'}
POSTGRES_HOST: ${process.env.POSTGRES_HOST ?? 'not set'}
POSTGRES_DB: ${process.env.POSTGRES_DB ?? 'not set'}
POSTGRES_USER: ${process.env.POSTGRES_USER ?? 'not set'}
PORT: ${process.env.PORT ?? 'not set'}
`);

// Check if file exists
logger.info(`\nChecking ${envFile} file:`);
try {
  const stats = fs.statSync(envPath);
  logger.info(`
File Status:
- Exists: ${stats.isFile()}
- Size: ${stats.size} bytes
- Permissions: ${stats.mode.toString(8)}
`);
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  logger.error(`Error checking env file: ${errorMessage}`);
  process.exit(1);
}
