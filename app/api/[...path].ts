/**
 * API Route Handler for Hono Backend
 * This file catches all API routes and forwards them to the Hono backend
 * Expo Router API routes - works with Vercel serverless functions
 */

import { handler } from '../../backend/hono';

export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}

export async function PUT(request: Request) {
  return handler(request);
}

export async function DELETE(request: Request) {
  return handler(request);
}

export async function PATCH(request: Request) {
  return handler(request);
}
