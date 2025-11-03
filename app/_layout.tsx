import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";

import { CouponProvider } from "@/contexts/CouponContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { trpc, trpcReactClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
      <Stack.Screen 
        name="auth/user-login" 
        options={{ 
          headerShown: true,
          headerTitle: "User Login",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="auth/business-login" 
        options={{ 
          headerShown: true,
          headerTitle: "Business Login",
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="auth/payment-setup" 
        options={{ 
          headerShown: false,
          presentation: "card"
        }} 
      />
      <Stack.Screen 
        name="business/dashboard" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="admin/review" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="coupon/[id]"
        options={{
          headerShown: true,
          headerTitle: "Coupon Details",
          presentation: "card",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcReactClient} queryClient={queryClient}>
        <AuthProvider>
          <CouponProvider>
            <GestureHandlerRootView style={styles.container}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </CouponProvider>
        </AuthProvider>
      </trpc.Provider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
