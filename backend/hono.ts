import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

const subscriptions = new Map<string, {
  customerId: string;
  email: string;
  subscriptionId: string;
  status: string;
  businessName?: string;
}>();

app.use("*", cors());

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    endpoint: "/api/trpc",
    onError({ error, type, path }) {
      console.error("tRPC Error:", { type, path, error: error.message, code: error.code });
    },
    responseMeta() {
      return {
        headers: {
          'Content-Type': 'application/json',
        },
      };
    },
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

app.post("/stripe-webhook", async (c) => {
  const body = await c.req.text();
  
  console.log("Webhook received");
  
  try {
    const payload = JSON.parse(body);
    const event = payload;
    
    console.log("Event type:", event.type);
    
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log("Checkout session completed:", session.id);
        
        subscriptions.set(session.customer_email || session.id, {
          customerId: session.customer,
          email: session.customer_email || "",
          subscriptionId: session.subscription || "",
          status: "active",
          businessName: session.metadata?.businessName,
        });
        
        console.log("Subscription saved for:", session.customer_email);
        break;
        
      case "customer.subscription.updated":
        const subscription = event.data.object;
        console.log("Subscription updated:", subscription.id, "Status:", subscription.status);
        
        for (const [email, data] of subscriptions.entries()) {
          if (data.subscriptionId === subscription.id) {
            subscriptions.set(email, { ...data, status: subscription.status });
            console.log("Updated subscription status for:", email);
            break;
          }
        }
        break;
        
      case "customer.subscription.deleted":
        const deletedSub = event.data.object;
        console.log("Subscription deleted:", deletedSub.id);
        
        for (const [email, data] of subscriptions.entries()) {
          if (data.subscriptionId === deletedSub.id) {
            subscriptions.set(email, { ...data, status: "canceled" });
            console.log("Marked subscription as canceled for:", email);
            break;
          }
        }
        break;
    }
    
    return c.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return c.json({ error: "Webhook processing failed" }, 400);
  }
});

// Fixed: Changed from "/check-subscription" to "/api/check-subscription"
app.get("/api/check-subscription", (c) => {
  const email = c.req.query("email");
  
  if (!email) {
    return c.json({ error: "Email required" }, 400);
  }
  
  const subscription = subscriptions.get(email);
  
  if (!subscription) {
    return c.json({ subscribed: false });
  }
  
  return c.json({
    subscribed: subscription.status === "active",
    status: subscription.status,
    subscriptionId: subscription.subscriptionId,
  });
});

// New: REST endpoint for redeeming coupons
app.post("/api/redeem-coupon", async (c) => {
  try {
    const body = await c.req.json();
    const { couponId, userId } = body;
    
    if (!couponId) {
      return c.json({ error: "Coupon ID is required" }, 400);
    }
    
    const redemption = {
      id: `redemption-${Date.now()}`,
      couponId,
      userId: userId || 'anonymous',
      redeemedAt: new Date().toISOString(),
    };
    
    console.log('Redeeming coupon via REST API:', redemption);
    
    return c.json({
      success: true,
      redemption,
    });
  } catch (error) {
    console.error("Error redeeming coupon:", error);
    return c.json({ 
      success: false,
      error: error instanceof Error ? error.message : "Failed to redeem coupon" 
    }, 500);
  }
});

app.get("/stripe-success", (c) => {
  const email = c.req.query("email") || "";
  const deepLink = `rork-app://auth/payment-setup?success=true&email=${encodeURIComponent(email)}`;
  
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

// Export handler for Expo Router API routes (Vercel serverless)
export const handler = async (request: Request) => {
  return app.fetch(request);
};
