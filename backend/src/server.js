import { createApp } from './app.js';
import { checkDatabaseConnection } from './config/db.js';
import { env } from './config/env.js';

async function bootstrap() {
  await checkDatabaseConnection();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Backend listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
