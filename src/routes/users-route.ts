import { Elysia, t } from 'elysia';
import { registerUser, loginUser, getCurrentUser, logoutUser } from '../services/users-service';
import { authMiddleware } from '../middleware/auth-middleware';

export const usersRoute = new Elysia({ prefix: '/api/users' })
  .post('/', async ({ body, set }) => {
    try {
      const user = await registerUser(body);
      
      set.status = 201;
      return {
        message: 'User created successfully',
        user
      };
    } catch (error: any) {
      if (error.code === '400') {
        set.status = 400;
        return {
          error: 'User already exists',
          message: `User with email ${body.email} already exists`,
          code: '400'
        };
      }
      
      set.status = 500;
      return {
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred'
      };
    }
  }, {
    body: t.Object({
      name: t.String({ maxLength: 255 }),
      email: t.String({ format: 'email', maxLength: 255 }),
      password: t.String({ minLength: 6, maxLength: 255 })
    })
  })
  .post('/login', async ({ body, set }) => {
    try {
      const session = await loginUser(body);
      
      return {
        message: 'User login successfully',
        session
      };
    } catch (error: any) {
      if (error.code === '401') {
        set.status = 401;
        return {
          error: 'Email atau Password salah',
          message: `User dengan email ${body.email} tidak terdaftar atau password salah`,
          code: '401'
        };
      }
      
      set.status = 500;
      return {
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
        code: '500'
      };
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String()
    })
  })
  .group('', (app) => app
    .use(authMiddleware)
    .get('/current', async ({ token, set }) => {
      try {
        const userData = await getCurrentUser(token!);

        return {
          data: userData
        };
      } catch (error: any) {
        if (error.code === '401') {
          set.status = 401;
          return {
            error: 'Unauthorized',
            message: 'Token tidak valid',
            code: '401'
          };
        }

        set.status = 500;
        return {
          error: 'Internal Server Error',
          message: error.message || 'An unexpected error occurred'
        };
      }
    })
    .delete('/logout', async ({ token, set }) => {
      try {
        await logoutUser(token!);

        return {
          data: {
            message: 'Logout berhasil',
            code: '200'
          }
        };
      } catch (error: any) {
        if (error.code === '401') {
          set.status = 401;
          return {
            error: 'Unauthorized',
            message: 'Token tidak valid',
            code: '401'
          };
        }

        set.status = 500;
        return {
          error: 'Internal Server Error',
          message: error.message || 'An unexpected error occurred'
        };
      }
    })
  );
