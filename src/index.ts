import { Elysia } from 'elysia';
import { db } from './db';
import { users } from './db/schema';

const app = new Elysia()
  .get('/', () => 'Welcome to Vibe Code API')
  .get('/ping', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
  .get('/users', async () => {
    try {
      return await db.select().from(users);
    } catch (error: any) {
      return { 
        error: 'Database connection failed',
        message: error.message,
        code: error.code
      };
    }
  })
  .listen(process.env.PORT || 3000);

console.log(
  `🚀 Server is running at ${app.server?.hostname}:${app.server?.port}`
);
