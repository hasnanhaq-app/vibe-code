import { Elysia } from 'elysia';

export const authMiddleware = new Elysia()
  .derive(({ headers }) => {
    const authHeader = headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return {
        token: authHeader.substring(7)
      };
    }
    return {
      token: null
    };
  })
  .onBeforeHandle(({ token, set }) => {
    if (!token) {
      set.status = 401;
      return {
        error: 'Unauthorized',
        message: 'Token tidak valid',
        code: '401'
      };
    }
  });
