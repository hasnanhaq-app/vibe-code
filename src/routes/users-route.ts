import { Elysia, t } from 'elysia';
import { registerUser } from '../services/users-service';

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
  });
