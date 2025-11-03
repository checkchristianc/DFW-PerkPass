import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use("*", cors());

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

app.get("/stripe-success", (c) => {
  const deepLink = "rork-app://auth/payment-setup?success=true";
  
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Successful</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
        }
        .container {
          text-align: center;
          max-width: 400px;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        p {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          line-height: 1.5;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: white;
          color: #667eea;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: scale(1.05);
        }
        .instructions {
          margin-top: 2rem;
          font-size: 0.9rem;
          opacity: 0.9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✅ Payment Successful!</h1>
        <p>Your subscription has been activated. Click the button below to return to the app.</p>
        <a href="${deepLink}" class="button">Open App</a>
        <p class="instructions">If the app doesn't open automatically, please click the button above.</p>
      </div>
      <script>
        // Attempt to open the app immediately
        window.location.href = "${deepLink}";
        
        // If user is still on this page after 2 seconds, they might need to click the button
        // This handles cases where the browser blocks the automatic redirect
      </script>
    </body>
    </html>
  `);
});

export default app;
