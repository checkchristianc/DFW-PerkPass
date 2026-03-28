import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from './types';

export const trpc = createTRPCReact<AppRouter>();

export const client = trpc.createClient({
  url: 'https://dfwperkpassbackend-production.up.railway.app/trpc',
});

