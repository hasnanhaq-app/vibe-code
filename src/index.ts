import { Elysia } from 'elysia';
import { db } from './db';
import { users } from './db/schema';
import { usersRoute } from './routes/users-route';

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
  .onError(({ code, error, set }) => {
    const isProd = process.env.NODE_ENV === 'production';
    
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { error: 'Not Found', message: 'Route tidak ditemukan' };
    }
    
    // Default to 500 if status is not already set by a specific handler
    if (set.status === 200) set.status = 500;
    
    return {
      error: 'Internal Server Error',
      message: isProd ? 'Terjadi kesalahan pada server' : error.message,
      stack: isProd ? undefined : error.stack
    };
  })
  .use(usersRoute)
  .listen(process.env.PORT || 3000);

console.log(
  `🚀 Server is running at ${app.server?.hostname}:${app.server?.port}`
);
