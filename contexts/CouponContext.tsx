import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';

import { MOCK_COUPONS, MOCK_PENDING_COUPONS } from '@/mocks/coupons';
import { Category, CouponStatus } from '@/types/coupon';

const FAVORITES_KEY = 'coupon_favorites';
const APPROVED_COUPONS_KEY = 'approved_coupons';
const PENDING_COUPONS_KEY = 'pending_coupons';

export const [CouponProvider, useCoupons] = createContextHook(() => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [pendingCoupons, setPendingCoupons] = useState(MOCK_PENDING_COUPONS);
  const [approvedCoupons, setApprovedCoupons] = useState<any[]>([]);

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

  const saveFavoritesMutation = useMutation({
    mutationFn: async (newFavorites: string[]) => {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    }
  });

  const saveApprovedCouponsMutation = useMutation({
    mutationFn: async (newApprovedCoupons: any[]) => {
      await AsyncStorage.setItem(APPROVED_COUPONS_KEY, JSON.stringify(newApprovedCoupons));
      return newApprovedCoupons;
    }
  });

  const savePendingCouponsMutation = useMutation({
    mutationFn: async (newPendingCoupons: any[]) => {
      await AsyncStorage.setItem(PENDING_COUPONS_KEY, JSON.stringify(newPendingCoupons));
      return newPendingCoupons;
    }
  });

  const { mutate: mutateFavorites } = saveFavoritesMutation;
  const { mutate: mutateApprovedCoupons } = saveApprovedCouponsMutation;
  const { mutate: mutatePendingCoupons } = savePendingCouponsMutation;

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

  const toggleFavorite = useCallback((couponId: string) => {
    const newFavorites = favorites.includes(couponId)
      ? favorites.filter(id => id !== couponId)
      : [...favorites, couponId];
    
    setFavorites(newFavorites);
    mutateFavorites(newFavorites);
  }, [favorites, mutateFavorites]);

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
    const couponToApprove = pendingCoupons.find(c => c.id === couponId);
    if (couponToApprove) {
      const approvedCoupon = {
        ...couponToApprove,
        status: 'approved' as CouponStatus,
        reviewedAt: new Date().toISOString(),
      };
      const newPendingCoupons = pendingCoupons.filter(c => c.id !== couponId);
      const newApprovedCoupons = [approvedCoupon, ...approvedCoupons];
      
      setPendingCoupons(newPendingCoupons);
      setApprovedCoupons(newApprovedCoupons);
      
      mutatePendingCoupons(newPendingCoupons);
      mutateApprovedCoupons(newApprovedCoupons);
    }
  }, [pendingCoupons, approvedCoupons, mutatePendingCoupons, mutateApprovedCoupons]);

  const denyCoupon = useCallback((couponId: string) => {
    console.log('Denying coupon:', couponId);
    const newPendingCoupons = pendingCoupons.filter(c => c.id !== couponId);
    setPendingCoupons(newPendingCoupons);
    mutatePendingCoupons(newPendingCoupons);
  }, [pendingCoupons, mutatePendingCoupons]);

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
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
      isFeatured: false,
      redemptionInstructions: couponData.redemptionInstructions || 'Show this coupon at checkout',
      status: 'pending' as CouponStatus,
      submittedAt: new Date().toISOString(),
    };
    
    console.log('Submitting new coupon:', newCoupon);
    const newPendingCoupons = [newCoupon, ...pendingCoupons];
    setPendingCoupons(newPendingCoupons);
    mutatePendingCoupons(newPendingCoupons);
  }, [pendingCoupons, mutatePendingCoupons]);

  return useMemo(() => ({
    coupons: filteredCoupons,
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
  }), [
    filteredCoupons,
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
    favoritesQuery.isLoading,
    approvedCouponsQuery.isLoading,
    pendingCouponsQuery.isLoading,
    pendingCoupons,
    approveCoupon,
    denyCoupon,
    submitCoupon,
  ]);
});
