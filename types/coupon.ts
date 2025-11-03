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
}
