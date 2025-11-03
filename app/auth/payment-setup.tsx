import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard, DollarSign, CheckCircle, ExternalLink } from 'lucide-react-native';
import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';

import Colors from '@/constants/colors';
import { STRIPE_CONFIG } from '@/constants/stripe';
import { useAuth } from '@/contexts/AuthContext';

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_7sYbJ14447TH0u72H8cwg00';

export default function PaymentSetupScreen() {
  const params = useLocalSearchParams();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();

  const businessData = useMemo(() => ({
    businessName: params.businessName as string,
    ownerName: params.ownerName as string,
    email: params.email as string,
  }), [params.businessName, params.ownerName, params.email]);

  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      console.log('Deep link received:', event.url);
      
      if (event.url.includes('payment-success') || event.url.includes('success=true')) {
        console.log('Payment successful, logging in user');
        
        const user = {
          id: Date.now().toString(),
          email: businessData.email,
          name: businessData.ownerName,
          type: 'business' as const,
          businessName: businessData.businessName,
          subscriptionActive: true,
        };

        login(user);
        router.replace('/business/dashboard');
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    return () => {
      subscription.remove();
    };
  }, [businessData, login]);

  const handleSetupPayment = async () => {
    console.log('Opening Stripe payment link');

    if (!businessData.businessName || !businessData.email) {
      console.error('Missing business data');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(STRIPE_PAYMENT_LINK);
      
      if (canOpen) {
        await Linking.openURL(STRIPE_PAYMENT_LINK);
      } else {
        console.error('Cannot open Stripe payment link');
      }
    } catch (err) {
      console.error('Error opening payment link:', err);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <CreditCard size={48} color={Colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.title}>Complete Your Subscription</Text>
            <Text style={styles.subtitle}>
              You&apos;ll be redirected to Stripe to complete your payment securely
            </Text>
          </View>

          <View style={styles.businessInfo}>
            <Text style={styles.businessInfoLabel}>Business Account</Text>
            <Text style={styles.businessInfoValue}>{businessData.businessName}</Text>
            <Text style={styles.businessInfoEmail}>{businessData.email}</Text>
          </View>

          <View style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <DollarSign size={28} color={Colors.primary} strokeWidth={2.5} />
              <Text style={styles.pricingPrice}>${STRIPE_CONFIG.monthlySubscriptionPrice}</Text>
              <Text style={styles.pricingPeriod}>/month</Text>
            </View>
            <Text style={styles.pricingDescription}>
              Full access to all business features
            </Text>
          </View>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color={Colors.success} />
              <Text style={styles.featureText}>Unlimited coupon listings</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color={Colors.success} />
              <Text style={styles.featureText}>Featured placement options</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color={Colors.success} />
              <Text style={styles.featureText}>Customer analytics dashboard</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle size={20} color={Colors.success} />
              <Text style={styles.featureText}>Cancel anytime</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <ExternalLink size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              After payment, you&apos;ll be automatically redirected back to the app
            </Text>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSetupPayment}
            activeOpacity={0.8}
          >
            <CreditCard size={20} color={Colors.accent} />
            <Text style={styles.submitButtonText}>
              Continue to Stripe
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  businessInfo: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  businessInfoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  businessInfoValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  businessInfoEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pricingCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pricingPrice: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginLeft: 8,
  },
  pricingPeriod: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
    marginLeft: 4,
  },
  pricingDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  features: {
    gap: 12,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
});
