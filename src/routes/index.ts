import { Hono } from 'hono';

import type { AppContext } from '@/types/context';

const routes = new Hono<AppContext>();

// TODO: implement feature modules here.
// Mount each feature router under its own prefix, e.g.:
//   import { usersRoutes } from '@modules/users/users.routes';
//   routes.route('/users', usersRoutes);

export { routes };
