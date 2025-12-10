// /lib/trpc.ts

import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

// The URL of your deployed backend
const API_URL = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || "https://dfwperkpassbackend-production.up.railway.app/";

// Create TRPC hooks for your app
export const trpc = createTRPCReact<any>();

// TRPC client for React Query
export const trpcReactClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: API_URL,
      headers() {
        return {
          'Content-Type': 'application/json',
        };
      },
    }),
  ],
});

// Another TRPC client if you need a direct client instance
export const trpcClient = createTRPCClient<any>({
  links: [
    httpBatchLink({
      url: API_URL,
      headers() {
        return {
          'Content-Type': 'application/json',
        };
      },
    }),
  ],
});
