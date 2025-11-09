import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
};

export const trpcReactClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
});

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers: () => {
        return {
          'Content-Type': 'application/json',
        };
      },
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          credentials: 'include',
        }).then(async (response) => {
          if (!response.ok) {
            const text = await response.text();
            console.error('HTTP error response:', text);
            throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
          }
          
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            throw new Error(`Expected JSON response but got: ${contentType}. Body: ${text}`);
          }
          
          return response;
        });
      },
    }),
  ],
});
