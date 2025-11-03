export type Category = 
  | 'Food & Dining'
  | 'Shopping'
  | 'Entertainment'
  | 'Travel'
  | 'Beauty & Wellness'
  | 'Services'
  | 'Fitness'
  | 'Electronics';

export type CouponStatus = 'pending' | 'approved' | 'denied';

export interface Coupon {
  id: string;
  businessName: string;
  businessId?: string;
  title: string;
  description: string;
  discount: string;
  category: Category;
  expiresAt: string;
  code?: string;
  terms?: string;
  imageUrl: string;
  isFeatured: boolean;
  redemptionInstructions: string;
  status: CouponStatus;
  submittedAt: string;
  reviewedAt?: string;
  totalRedemptions?: number;
  viewCount?: number;
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  userId?: string;
  redeemedAt: string;
  deviceInfo?: string;
}

export interface CouponAnalytics {
  couponId: string;
  title: string;
  totalViews: number;
  totalRedemptions: number;
  conversionRate: number;
  lastRedeemedAt?: string;
  redemptionsByDate: { date: string; count: number }[];
}
