import { Elysia, t } from 'elysia';
import { registerUser, loginUser, getCurrentUser, logoutUser } from '../services/users-service';

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
      name: t.String(),
      email: t.String(),
      password: t.String()
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
      email: t.String(),
      password: t.String()
    })
  })
  .get('/current', async ({ request, set }) => {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        return {
          error: 'Unauthorized',
          message: 'Token tidak valid',
          code: '401'
        };
      }

      const token = authHeader.substring(7);
      const userData = await getCurrentUser(token);

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
  .delete('/logout', async ({ request, set }) => {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        return {
          error: 'Unauthorized',
          message: 'Token tidak valid',
          code: '401'
        };
      }

      const token = authHeader.substring(7);
      await logoutUser(token);

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
  });
