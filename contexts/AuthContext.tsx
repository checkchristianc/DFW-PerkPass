import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';

const AUTH_KEY = 'auth_data';

export type UserType = 'consumer' | 'business';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  type: UserType;
  businessName?: string;
  subscriptionActive?: boolean;
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
  stripeConnectedAccountId?: string;
  profilePicture?: string;
}

interface AuthData {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authData, setAuthData] = useState<AuthData>({
    user: null,
    isAuthenticated: false,
  });

  const authQuery = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_KEY);
        if (!stored) return { user: null, isAuthenticated: false };
        return JSON.parse(stored);
      } catch (error) {
        console.log('Error loading auth data:', error);
        return { user: null, isAuthenticated: false };
      }
    }
  });

  const saveAuthMutation = useMutation({
    mutationFn: async (data: AuthData) => {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(data));
      return data;
    }
  });

  const { mutate: mutateAuth } = saveAuthMutation;

  useEffect(() => {
    if (authQuery.data) {
      setAuthData(authQuery.data);
    }
  }, [authQuery.data]);

  const login = useCallback((user: AuthUser) => {
    const data: AuthData = { user, isAuthenticated: true };
    setAuthData(data);
    mutateAuth(data);
  }, [mutateAuth]);

  const logout = useCallback(() => {
    const data: AuthData = { user: null, isAuthenticated: false };
    setAuthData(data);
    mutateAuth(data);
  }, [mutateAuth]);

  const updateSubscription = useCallback((active: boolean) => {
    if (authData.user && authData.user.type === 'business') {
      const updatedUser = { ...authData.user, subscriptionActive: active };
      const data: AuthData = { user: updatedUser, isAuthenticated: true };
      setAuthData(data);
      mutateAuth(data);
    }
  }, [authData.user, mutateAuth]);

  const updateProfilePicture = useCallback((profilePicture: string) => {
    if (authData.user) {
      const updatedUser = { ...authData.user, profilePicture };
      const data: AuthData = { user: updatedUser, isAuthenticated: true };
      setAuthData(data);
      mutateAuth(data);
    }
  }, [authData.user, mutateAuth]);

  return useMemo(() => ({
    user: authData.user,
    isAuthenticated: authData.isAuthenticated,
    login,
    logout,
    updateSubscription,
    updateProfilePicture,
    isLoading: authQuery.isLoading,
  }), [
    authData.user,
    authData.isAuthenticated,
    login,
    logout,
    updateSubscription,
    updateProfilePicture,
    authQuery.isLoading,
  ]);
});
