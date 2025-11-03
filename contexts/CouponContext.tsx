import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';

import { MOCK_COUPONS, MOCK_PENDING_COUPONS } from '@/mocks/coupons';
import { Category, CouponStatus, CouponRedemption } from '@/types/coupon';
import { trpcClient } from '@/lib/trpc';

const FAVORITES_KEY = 'coupon_favorites';
const APPROVED_COUPONS_KEY = 'approved_coupons';
const PENDING_COUPONS_KEY = 'pending_coupons';
const REDEMPTIONS_KEY = 'coupon_redemptions';
const VIEWS_KEY = 'coupon_views';

export const [CouponProvider, useCoupons] = createContextHook(() => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [pendingCoupons, setPendingCoupons] = useState(MOCK_PENDING_COUPONS);
  const [approvedCoupons, setApprovedCoupons] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<CouponRedemption[]>([]);
  const [views, setViews] = useState<Record<string, number>>({});

  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
      } catch (error) {
        console.log('Error loading favorites:', error);
        return [];
      }
    }
  });

  const approvedCouponsQuery = useQuery({
    queryKey: ['approvedCoupons'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(APPROVED_COUPONS_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
      } catch (error) {
        console.log('Error loading approved coupons:', error);
        return [];
      }
    }
  });

  const pendingCouponsQuery = useQuery({
    queryKey: ['pendingCoupons'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(PENDING_COUPONS_KEY);
        if (!stored) return MOCK_PENDING_COUPONS;
        return JSON.parse(stored);
      } catch (error) {
        console.log('Error loading pending coupons:', error);
        return MOCK_PENDING_COUPONS;
      }
    }
  });

  const redemptionsQuery = useQuery({
    queryKey: ['redemptions'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(REDEMPTIONS_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
      } catch (error) {
        console.log('Error loading redemptions:', error);
        return [];
      }
    }
  });

  const viewsQuery = useQuery({
    queryKey: ['views'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(VIEWS_KEY);
        if (!stored) return {};
        return JSON.parse(stored);
      } catch (error) {
        console.log('Error loading views:', error);
        return {};
      }
    }
  });

  const { mutate: mutateFavorites } = useMutation({
    mutationFn: async (newFavorites: string[]) => {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    }
  });

  const { mutate: mutateApprovedCoupons } = useMutation({
    mutationFn: async (newApprovedCoupons: any[]) => {
      await AsyncStorage.setItem(APPROVED_COUPONS_KEY, JSON.stringify(newApprovedCoupons));
      return newApprovedCoupons;
    }
  });

  const { mutate: mutatePendingCoupons } = useMutation({
    mutationFn: async (newPendingCoupons: any[]) => {
      await AsyncStorage.setItem(PENDING_COUPONS_KEY, JSON.stringify(newPendingCoupons));
      return newPendingCoupons;
    }
  });

  const { mutate: mutateRedemptions } = useMutation({
    mutationFn: async (newRedemptions: CouponRedemption[]) => {
      await AsyncStorage.setItem(REDEMPTIONS_KEY, JSON.stringify(newRedemptions));
      return newRedemptions;
    }
  });

  const { mutate: mutateViews } = useMutation({
    mutationFn: async (newViews: Record<string, number>) => {
      await AsyncStorage.setItem(VIEWS_KEY, JSON.stringify(newViews));
      return newViews;
    }
  });



  useEffect(() => {
    if (favoritesQuery.data) {
      setFavorites(favoritesQuery.data);
    }
  }, [favoritesQuery.data]);

  useEffect(() => {
    if (approvedCouponsQuery.data) {
      setApprovedCoupons(approvedCouponsQuery.data);
    }
  }, [approvedCouponsQuery.data]);

  useEffect(() => {
    if (pendingCouponsQuery.data) {
      setPendingCoupons(pendingCouponsQuery.data);
    }
  }, [pendingCouponsQuery.data]);

  useEffect(() => {
    if (redemptionsQuery.data) {
      setRedemptions(redemptionsQuery.data);
    }
  }, [redemptionsQuery.data]);

  useEffect(() => {
    if (viewsQuery.data) {
      setViews(viewsQuery.data);
    }
  }, [viewsQuery.data]);

  const toggleFavorite = useCallback((couponId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(couponId)
        ? prev.filter(id => id !== couponId)
        : [...prev, couponId];
      
      mutateFavorites(newFavorites);
      return newFavorites;
    });
  }, [mutateFavorites]);

  const isFavorite = useCallback((couponId: string) => favorites.includes(couponId), [favorites]);

  const allCoupons = useMemo(() => {
    return [...MOCK_COUPONS, ...approvedCoupons];
  }, [approvedCoupons]);

  const filteredCoupons = useMemo(() => {
    let result = allCoupons;

    if (selectedCategory !== 'All') {
      result = result.filter(c => c.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.businessName.toLowerCase().includes(query) ||
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedCategory, searchQuery, allCoupons]);

  const featuredCoupons = useMemo(() => 
    allCoupons.filter(c => c.isFeatured),
    [allCoupons]
  );

  const favoriteCoupons = useMemo(() => 
    allCoupons.filter(c => favorites.includes(c.id)),
    [allCoupons, favorites]
  );

  const categories: (Category | 'All')[] = useMemo(() => [
    'All',
    'Food & Dining',
    'Shopping',
    'Entertainment',
    'Travel',
    'Beauty & Wellness',
    'Services',
    'Fitness',
    'Electronics'
  ], []);

  const approveCoupon = useCallback((couponId: string) => {
    console.log('Approving coupon:', couponId);
    setPendingCoupons(prev => {
      const couponToApprove = prev.find(c => c.id === couponId);
      if (!couponToApprove) return prev;
      
      const approvedCoupon = {
        ...couponToApprove,
        status: 'approved' as CouponStatus,
        reviewedAt: new Date().toISOString(),
      };
      const newPendingCoupons = prev.filter(c => c.id !== couponId);
      
      setApprovedCoupons(prevApproved => {
        const newApprovedCoupons = [approvedCoupon, ...prevApproved];
        mutateApprovedCoupons(newApprovedCoupons);
        return newApprovedCoupons;
      });
      
      mutatePendingCoupons(newPendingCoupons);
      return newPendingCoupons;
    });
  }, [mutateApprovedCoupons, mutatePendingCoupons]);

  const denyCoupon = useCallback((couponId: string) => {
    console.log('Denying coupon:', couponId);
    setPendingCoupons(prev => {
      const newPendingCoupons = prev.filter(c => c.id !== couponId);
      mutatePendingCoupons(newPendingCoupons);
      return newPendingCoupons;
    });
  }, [mutatePendingCoupons]);

  const submitCoupon = useCallback((couponData: {
    title: string;
    description: string;
    discount: string;
    category: Category;
    expiresAt: string;
    code?: string;
    terms?: string;
    redemptionInstructions?: string;
    businessName: string;
    imageUrl?: string;
  }) => {
    const newCoupon = {
      id: `coupon-${Date.now()}`,
      businessName: couponData.businessName,
      title: couponData.title,
      description: couponData.description,
      discount: couponData.discount,
      category: couponData.category,
      expiresAt: couponData.expiresAt || 'No expiration',
      code: couponData.code,
      terms: couponData.terms,
      imageUrl: couponData.imageUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
      isFeatured: false,
      redemptionInstructions: couponData.redemptionInstructions || 'Show this coupon at checkout',
      status: 'pending' as CouponStatus,
      submittedAt: new Date().toISOString(),
      totalRedemptions: 0,
      viewCount: 0,
    };
    
    console.log('Submitting new coupon:', JSON.stringify(newCoupon, null, 2));
    console.log('Current pending coupons before submission:', pendingCoupons.length);
    
    setPendingCoupons(prev => {
      const newPendingCoupons = [newCoupon, ...prev];
      console.log('New pending coupons array length:', newPendingCoupons.length);
      console.log('All pending coupons:', JSON.stringify(newPendingCoupons.map(c => ({ id: c.id, businessName: c.businessName, title: c.title })), null, 2));
      mutatePendingCoupons(newPendingCoupons);
      return newPendingCoupons;
    });
  }, [mutatePendingCoupons, pendingCoupons]);

  const redeemCoupon = useCallback(async (couponId: string, userId?: string) => {
    console.log('Redeeming coupon:', couponId);
    
    try {
      const result = await trpcClient.coupons.redeem.mutate({ couponId, userId });
      
      if (result.success) {
        const newRedemption: CouponRedemption = {
          id: result.redemption.id,
          couponId,
          userId,
          redeemedAt: result.redemption.redeemedAt,
        };
        
        setRedemptions(prev => {
          const newRedemptions = [...prev, newRedemption];
          mutateRedemptions(newRedemptions);
          return newRedemptions;
        });
        
        return { success: true };
      }
      
      return { success: false };
    } catch (error) {
      console.log('Error redeeming coupon:', error);
      return { success: false };
    }
  }, [mutateRedemptions]);

  const trackView = useCallback(async (couponId: string) => {
    console.log('Tracking view for coupon:', couponId);
    
    setViews(prev => {
      const newViews = { ...prev, [couponId]: (prev[couponId] || 0) + 1 };
      mutateViews(newViews);
      return newViews;
    });
    
    try {
      await trpcClient.coupons.trackView.mutate({ couponId });
    } catch (error) {
      console.log('Error tracking view:', error);
    }
  }, [mutateViews]);

  const getCouponStats = useCallback((couponId: string) => {
    const redemptionCount = redemptions.filter(r => r.couponId === couponId).length;
    const viewCount = views[couponId] || 0;
    const conversionRate = viewCount > 0 ? (redemptionCount / viewCount) * 100 : 0;
    
    return {
      views: viewCount,
      redemptions: redemptionCount,
      conversionRate: conversionRate.toFixed(1),
    };
  }, [redemptions, views]);

  return useMemo(() => ({
    coupons: filteredCoupons,
    allCoupons,
    featuredCoupons,
    favoriteCoupons,
    favorites,
    toggleFavorite,
    isFavorite,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    isLoading: favoritesQuery.isLoading || approvedCouponsQuery.isLoading || pendingCouponsQuery.isLoading,
    pendingCoupons,
    approveCoupon,
    denyCoupon,
    submitCoupon,
    redeemCoupon,
    trackView,
    getCouponStats,
    redemptions,
    views,
  }), [
    filteredCoupons,
    allCoupons,
    featuredCoupons,
    favoriteCoupons,
    favorites,
    toggleFavorite,
    isFavorite,
    searchQuery,
    selectedCategory,
    categories,
    favoritesQuery.isLoading,
    approvedCouponsQuery.isLoading,
    pendingCouponsQuery.isLoading,
    pendingCoupons,
    approveCoupon,
    denyCoupon,
    submitCoupon,
    redeemCoupon,
    trackView,
    getCouponStats,
    redemptions,
    views,
  ]);
});
