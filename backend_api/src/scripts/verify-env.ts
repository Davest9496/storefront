import dotenv from 'dotenv';
import path from 'path';

const envFile =
  process.env.ENV === 'production' ? '.env.production' : '.env';
const envPath = path.resolve(process.cwd(), envFile);

console.log('Current working directory:', process.cwd());
console.log('Loading environment from:', envPath);

dotenv.config({ path: envPath });

console.log('\nEnvironment Variables:');
console.log('NODE_ENV:', process.env.ENV);
console.log('ENV:', process.env.ENV);
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('POSTGRES_DB:', process.env.POSTGRES_DB);
console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
console.log('PORT:', process.env.PORT);

// Check if file exists
import fs from 'fs';
console.log('\nChecking .env.production file:');
try {
  const stats = fs.statSync(envPath);
  console.log('File exists:', stats.isFile());
  console.log('File size:', stats.size, 'bytes');
  console.log('File permissions:', stats.mode.toString(8));
} catch (error) {
  console.error('Error checking file:', error);
}
