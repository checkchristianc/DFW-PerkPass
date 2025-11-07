import { STRIPE_CONFIG } from '@/constants/stripe';

export interface StripePaymentMethodData {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export interface StripeCustomerData {
  id: string;
  email: string;
  name: string;
}

export interface StripeSubscriptionData {
  id: string;
  customerId: string;
  status: 'active' | 'canceled' | 'incomplete' | 'past_due';
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}

export async function createStripeCustomer(
  email: string,
  name: string,
  paymentMethodId: string
): Promise<StripeCustomerData | null> {
  console.log('Note: Using external Stripe payment link. This function is not used.');
  return null;
}

export async function createSubscription(
  customerId: string,
  paymentMethodId: string
): Promise<StripeSubscriptionData | null> {
  console.log('Note: Using external Stripe payment link. This function is not used.');
  return null;
}

export async function setupConnectedAccount(businessName: string, email: string): Promise<string | null> {
  console.log('Note: Using external Stripe payment link. This function is not used.');
  return null;
}

export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * (STRIPE_CONFIG.platformFeePercentage / 100));
}

export function calculateBusinessPayout(amount: number): number {
  const platformFee = calculatePlatformFee(amount);
  return amount - platformFee;
}
